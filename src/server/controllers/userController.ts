import { Request, response, Response } from "express";
import bcrypt from 'bcrypt';
import dbServices from "../../services/dbServices";
import { SafeUser, UserWithPassword } from "../models/user";
import { generateAccessToken } from "../middleware";
import { HttpResponse } from "../helpers/http-responses";

const httpResponse = new HttpResponse(response);

type UserRegistration = Omit<UserWithPassword,
	'id' | 'is_admin' | 'is_active' | 'created_at' | 'updated_at'
>;

export const getUsers = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const query = 'SELECT username,created_at,updated_at FROM users WHERE id = $1';
		const result = await dbServices.query<SafeUser>(query, [id]);

		if (result.rows.length === 0) {
			httpResponse.userNotFound();
			return;
		}

		res.json({ data: result.rows[0] });
	} catch (error) {
		console.error('Error fetching data: ', error);
		httpResponse.internalServerError();
	}
};

export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const offset = (page - 1) * limit;

		const query = 'SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
		const countQuery = 'SELECT COUNT(*) FROM users';

		const result = await dbServices.query<SafeUser>(query, [limit, offset]);
		const countResult = await dbServices.query<Pick<SafeUser, 'id'>>(countQuery);

		const totalUsers = countResult.rows[0].id;
		const totalPages = Math.ceil(totalUsers / limit);

		res.json({
			users: result.rows,
			pagination: {
				totalUsers,
				totalPages,
				currentPage: page,
				limit
			}
		});
	} catch (error) {
		console.error('Error fetching users: ', error);
		httpResponse.internalServerError();
	}
};

export const createUser = async (req: Request<{}, {}, UserRegistration>, res: Response) => {
	try {
		const { username, email, password }: UserRegistration = req.body;


		// Validasi biasa
		if (!username || !email || !password) {
			httpResponse.badRequest('Username, email dan password wajib hukumnya untuk diisi');
			return;
		}

		// Cek jika username atau email ada di DB
		const checkQuery = 'SELECT id FROM users WHERE username = $1 OR email = $2';
		const checkResult = await dbServices.query<UserWithPassword>(checkQuery, [username, email]);

		if (checkResult.rows.length > 0) {
			httpResponse.conflictUsernameOrEmailExists();
			return
		}

		// Hashing password sebelum dimasukkin
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Insert data dengan type safety
		const insertQuery = `
      		INSERT INTO users (
      		  username, 
      		  email, 
      		  password,
      		  is_admin,
      		  is_active,
      		  created_at, 
      		  updated_at
      		) 
      		VALUES ($1, $2, $3, $4, $5, false, true, NOW(), NOW())
      		RETURNING 
      		  id, 
      		  username, 
      		  email, 
      		  is_admin,
      		  is_active,
      		  created_at, 
      		  updated_at
		`;
		const token = generateAccessToken({ username: req.body.username });

		const insertResult = await dbServices.query<SafeUser>(insertQuery, [
			username,
			email.toLowerCase(),
			hashedPassword
		]);

		const newUser: SafeUser = insertResult.rows[0];
		res.json(token);

		res.status(201).json({
			message: 'User berhasil dibuat',
			user: newUser,
		});

	} catch (error) {
		console.error('Error creating user: ', error);
		httpResponse.internalServerError();
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { email }: UserRegistration = req.body;

		// Cek id user
		const checkQuery = 'SELECT id FROM users WHERE id = $1';
		const checkResult = await dbServices.query<SafeUser>(checkQuery, [id]);

		if (checkResult.rows.length === 0) {
			httpResponse.userNotFound();
			return
		}

		// Update user data
		const updateQuery = `
      		UPDATE users 
      		SET 
      		  first_name = COALESCE($1, first_name),
      		  last_name = COALESCE($2, last_name),
      		  email = COALESCE($3, email),
      		  updated_at = NOW()
      		WHERE id = $4
      		RETURNING id, username, email, created_at, updated_at
		`;

		const updateResult = await dbServices.query<Pick<SafeUser, 'id'>>(updateQuery, [
			email,
			id
		]);

		res.json({
			message: 'User berhasil diperbarui',
			user: updateResult.rows[0]
		});
	} catch (error) {
		console.error('Error updating user: ', error);
		httpResponse.internalServerError();
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Check if user exists
		const checkQuery = 'SELECT id FROM users WHERE id = $1';
		const checkResult = await dbServices.query<Pick<SafeUser, 'id'>>(checkQuery, [id]);

		if (checkResult.rows.length === 0) {
			httpResponse.userNotFound();
			return;
		}

		// Delete user
		const deleteQuery = 'DELETE FROM users WHERE id = $1';
		await dbServices.query<Pick<SafeUser, 'id'>>(deleteQuery, [id]);

		res.json({ message: 'User berhasil dihapus' });
	} catch (error) {
		console.error('Error deleting user: ', error);
		httpResponse.internalServerError();
	}
};

export const changePassword = async (req: Request, res: Response) => {
	try {
		const { username } = req.params;
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			httpResponse.badRequest('Password lama dan baru hukumnya wajib diisi');
			return;
		}

		// Fetch user with password
		const userQuery = 'SELECT username, password FROM users WHERE username = $1';
		const userResult = await dbServices.query<UserWithPassword>(userQuery, [username]);

		if (userResult.rows.length === 0) {
			httpResponse.userNotFound();
			return;
		}

		// Verify current password
		const isPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);

		if (!isPasswordValid) {
			httpResponse.invalidRequest('Password lama tidak sesuai');
			return;
		}

		// Hash new password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

		// Update password
		const updateQuery = `
      		UPDATE users 
      		SET password = $1, updated_at = NOW()
      		WHERE username = $2
	    `;

		await dbServices.query<UserWithPassword>(updateQuery, [hashedPassword, username]);

		res.json({ message: 'Password berhasil diubah' });
	} catch (error) {
		console.error('Error changing password: ', error);
		httpResponse.internalServerError();
	}
};

export const searchUsers = async (req: Request, res: Response) => {
	try {
		const { query: searchQuery } = req.query;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const offset = (page - 1) * limit;

		if (!searchQuery) {
			httpResponse.badRequest('Parameter pencarian diperlukan');
			return;
		}

		const searchTerm = `%${searchQuery}%`;

		const query = `
      		SELECT id, username, email, created_at, updated_at 
      		FROM users 
      		WHERE 
      		  username ILIKE $1 OR
      		  first_name ILIKE $1 OR
      		  last_name ILIKE $1 OR
      		  email ILIKE $1
      		ORDER BY created_at DESC
      		LIMIT $2 OFFSET $3
		`;

		const countQuery = `
      		SELECT COUNT(*) 
      		FROM users 
      		WHERE 
      		  username ILIKE $1 OR
      		  first_name ILIKE $1 OR
      		  last_name ILIKE $1 OR
      		  email ILIKE $1
		`;

		const result = await dbServices.query<SafeUser>(query, [searchTerm, limit, offset]);
		const countResult = await dbServices.query<SafeUser>(countQuery, [searchTerm]);

		const totalUsers = countResult.rows[0].id;
		const totalPages = Math.ceil(totalUsers / limit);

		res.json({
			users: result.rows,
			pagination: {
				totalUsers,
				totalPages,
				currentPage: page,
				limit
			}
		});
	} catch (error) {
		console.error('Error searching users: ', error);
		httpResponse.internalServerError();
	}
};

export const getUserByUsername = async (req: Request, res: Response) => {
	try {
		const { username } = req.params;

		const query = 'SELECT id, username,   email, created_at, updated_at FROM users WHERE username = $1';
		const result = await dbServices.query<SafeUser>(query, [username]);

		if (result.rows.length === 0) {
			httpResponse.userNotFound();
			return;
		}

		res.json({ user: result.rows[0] });
	} catch (error) {
		console.error('Error fetching user: ', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};
