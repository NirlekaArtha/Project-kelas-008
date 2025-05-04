import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHttpResponse } from "../helpers/http-responses";
import { UserWithPassword } from "../models/user";
import dbServices from "../../services/dbServices";
import { generateAccessToken } from "../middleware";

export class LoginController {
	private readonly JWT_SECRET: string;
	private readonly JWT_EXPIRES_IN: string;

	constructor() {
		this.JWT_SECRET = process.env.access_token_secret || '';
		this.JWT_EXPIRES_IN = '24h';
	}

	/**
	 * Handle login request
	 * @param req Express request object
	 * @param res Express response object
	 */
	async handle(req: Request, res: Response): Promise<Response> {
		const httpRes = createHttpResponse(res);

		try {
			// Validasi input
			const { email, password } = req.body;

			if (!email || !password) {
				return httpRes.badRequestInputEmpty(['email', 'password']);
			}

			// Validasi format email sederhana
			if (!this.isValidEmail(email)) {
				return httpRes.badRequest('Format email tidak valid');
			}

			// Cari user berdasarkan email (tidak melibatkan password dalam query)
			const user = await this.findUserByEmail(email);

			// User tidak ditemukan
			if (!user) {
				// Menggunakan pesan generik untuk keamanan
				return httpRes.unauthorized('Email atau password tidak valid');
			}

			// Verifikasi status user aktif
			if (!user.is_active) {
				return httpRes.forbidden('Akun tidak aktif. Silakan hubungi administrator');
			}

			// Verifikasi password
			const isPasswordValid = await this.verifyPassword(password, user.password);

			if (!isPasswordValid) {
				// Menggunakan pesan generik untuk keamanan
				return httpRes.unauthorized('Email atau password tidak valid');
			}

			// Update last_login_at jika kolom tersebut ada
			await this.updateLastLogin(user.id);

			const token = generateAccessToken(user);

			// Mengembalikan data user tanpa password
			const { password: _, ...userWithoutPassword } = user;

			// Response sukses dengan token dan data user
			return httpRes.ok({
				user: userWithoutPassword,
				token
			}, 'Login berhasil');

		} catch (error) {
			console.error('Login error:', error);
			return httpRes.internalServerError('Terjadi kesalahan saat login', error as Error);
		}
	}

	/**
	 * Validasi format email sederhana
	 * @param email Email untuk divalidasi
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Mencari user berdasarkan email
	 * @param email Email user
	 */
	private async findUserByEmail(email: string): Promise<UserWithPassword | null> {
		try {
			const query = `
        		SELECT id, username, email, password, is_admin, is_active, jabatan
        		FROM users 
        		WHERE email = $1
			`;

			const result = await dbServices.query<UserWithPassword>(query, [email]);

			return result.rows.length > 0 ? result.rows[0] : null;
		} catch (error) {
			console.error('Error finding user:', error);
			throw error;
		}
	}

	/**
	 * Verifikasi password dengan bcrypt
	 * @param plaintextPassword Password yang diinput user
	 * @param hashedPassword Password hash dari database
	 */
	private async verifyPassword(plaintextPassword: string, hashedPassword: string): Promise<boolean> {
		try {
			return await bcrypt.compare(plaintextPassword, hashedPassword);
		} catch (error) {
			console.error('Password verification error:', error);
			return false;
		}
	}

	/**
	 * Update waktu login terakhir user
	 * @param userId ID user
	 */
	private async updateLastLogin(userId: number): Promise<void> {
		try {
			const query = `
        UPDATE users 
        SET last_login_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `;

			await dbServices.query(query, [userId]);
		} catch (error) {
			console.error('Error updating last login:', error);
		}
	}
}

export const loginController = new LoginController();
