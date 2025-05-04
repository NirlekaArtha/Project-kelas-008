import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import dbServices from "../../services/dbServices";
import { SafeUser, UserWithPassword } from "../models/user";
import { generateAccessToken } from "../middleware";
import { createHttpResponse } from "../helpers/http-responses";

// HACK: Cara agak dongo tapi ora ngapa lah yang penting gak ada error
interface CountResult {
	readonly count: string
};

type UserRegistration = Omit<UserWithPassword,
	'is_active' | 'created_at' | 'updated_at'
>;

export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const offset = (page - 1) * limit;

		const query = 'SELECT id, username, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
		const countQuery = 'SELECT COUNT(*) FROM users';

		const [result, countResult] = await Promise.all([
			dbServices.query<SafeUser>(query, [limit, offset]),
			dbServices.query<Pick<SafeUser, 'id'>>(countQuery),
		]);

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
		createHttpResponse(res).internalServerError('Gagal mengambil data users');
		return;
	}
};

export const createUser = async (req: Request<{}, {}, UserRegistration>, res: Response) => {
	const Res = createHttpResponse(res);

	try {
		const { username, email, password, jabatan }: UserRegistration = req.body;


		// Validasi biasa
		if (!username || !email || !password) {
			Res.badRequest('Username, email dan password wajib hukumnya untuk diisi');
			return;
		}

		// Cek jika username atau email ada di DB
		const checkQuery = 'SELECT id FROM users WHERE username = $1 OR email = $2';
		const checkResult = await dbServices.query<UserWithPassword>(checkQuery, [username, email]);

		if (checkResult.rows.length > 0) {
			Res.conflictUsernameOrEmailExists();
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
			  jabatan,
      		  is_admin,
      		  is_active,
      		  created_at, 
      		  updated_at
      		) 
      		VALUES ($1, $2, $3, $4, false, true, NOW(), NOW())
      		RETURNING 
      		  id, 
      		  username, 
      		  email, 
			  jabatan,
      		  is_admin,
      		  is_active,
      		  created_at, 
      		  updated_at
		`;

		const payload = {
			username,
			email: email.toLowerCase(),
			is_admin: false,
			jabatan
		};

		const token = generateAccessToken(payload);

		const insertResult = await dbServices.query<UserRegistration>(insertQuery, [
			username,
			email.toLowerCase(),
			hashedPassword,
			jabatan
		]);


		const newUser: UserRegistration = insertResult.rows[0];
		res.json(token);

		Res.created({ user: newUser, token: token })
		return;

	} catch (error) {
		console.error('Error creating user: ', error);
		createHttpResponse(res).internalServerError('Gagal membuat user');
		return;
	}
};

export const updateUser = async (req: Request, res: Response) => {
	const Res = createHttpResponse(res);

	try {
		const { id } = req.params;
		const { username, email, jabatan, khodam, description }: UserRegistration = req.body;

		// Cek id user
		const checkQuery = 'SELECT id FROM users WHERE id = $1';
		const checkResult = await dbServices.query<SafeUser>(checkQuery, [id]);

		if (checkResult.rows.length === 0) {
			Res.userNotFound();
			return
		}

		// Update user data
		const updateQuery = `
      		UPDATE users 
      		SET 
			  username = COALESCE($1, username),
      		  email = COALESCE($2, email),
			  jabatan = COALESCE($3, jabatan),
			  khodam = COALESCE($4, khodam),
			  deskripsi = COALESCE($5, deskripsi),
      		  updated_at = NOW()
      		WHERE id = $6
      		RETURNING id, username, email, jabatan, khodam, deskripsi, created_at, updated_at
		`;

		const updateResult = await dbServices.query<SafeUser>(updateQuery, [
			username,
			email,
			jabatan,
			khodam,
			description,
			id
		]);

		res.json({
			message: 'User berhasil diperbarui',
			user: updateResult.rows[0]
		});
	} catch (error) {
		console.error('Error updating user: ', error);
		Res.internalServerError();
	}
};

export const updateEmail = async (req: Request, res: Response) => {
	const e = createHttpResponse(res);
	try {
		const { id } = req.params;
	} catch (error) {

	}
}

export const deleteUser = async (req: Request, res: Response) => {
	const httpResponse = createHttpResponse(res);

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
	const httpResponse = createHttpResponse(res);

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
			httpResponse.unauthorized('Password lama tidak sesuai');
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
	const httpResponse = createHttpResponse(res);

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

		const [result, countResult] = await Promise.all([
			dbServices.query<SafeUser>(query, [searchTerm, limit, offset]),
			dbServices.query<CountResult>(countQuery, [searchTerm]),
		])

		const totalUsers = parseInt(countResult.rows[0].count);
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
	const httpResponse = createHttpResponse(res);

	try {
		const { username } = req.params;

		const query = 'SELECT id, username, created_at, updated_at FROM users WHERE username = $1';
		const result = await dbServices.query<SafeUser>(query, [username]);

		if (result.rows.length === 0) {
			httpResponse.userNotFound();
			return;
		}

		res.json({ user: result.rows[0] });
	} catch (error) {
		console.error('Error fetching user: ', error);
		httpResponse.internalServerError();
	}
};
