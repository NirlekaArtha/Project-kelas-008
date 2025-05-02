import { Response } from 'express';

export interface ResponseData {
	message?: string;
	data?: any;
	errors?: any;
	success?: boolean;
}

export class HttpResponse {
	private readonly response: Response;

	constructor(res: Response) {
		this.response = res;
	}

	/**
	 * Mengirim response dengan status code dan data yang ditentukan
	 * @param statusCode HTTP status code
	 * @param data Data yang akan dikirim
	 * @returns Response object untuk method chaining
	 */
	private send(statusCode: number, data: ResponseData): Response {
		return this.response.status(statusCode).json({
			success: statusCode < 400,
			...data
		});
	}

	/**
	 * Mengirim respons 200 OK dengan data atau pesan opsional
	 * @param data Data yang akan dikirim (optional)
	 * @param message Pesan sukses (optional)
	 * @returns Response object untuk method chaining
	 */
	ok(data?: any, message?: string): Response {
		return this.send(200, {
			data,
			message: message || 'Success'
		});
	}

	/**
	 * Mengirim respons 201 Created dengan data atau pesan opsional
	 * @param data Data yang akan dikirim (optional)
	 * @param message Pesan sukses (optional)
	 * @returns Response object untuk method chaining
	 */
	created(data?: any, message?: string): Response {
		return this.send(201, {
			data,
			message: message || 'Resource created successfully'
		});
	}

	/**
	 * Mengirim respons 204 No Content
	 * @returns Response object untuk method chaining
	 */
	noContent(): Response {
		return this.response.status(204).end();
	}

	/**
	 * Mengirim respons 400 Bad Request dengan pesan kustom
	 * @param message Pesan error yang akan ditampilkan (default: 'Bad request')
	 * @param errors Detail errors (optional)
	 * @returns Response object untuk method chaining
	 */
	badRequest(message: string = 'Bad request', errors?: any): Response {
		return this.send(400, { message, errors });
	}

	/**
	 * Mengirim respons 400 Bad Request untuk input kosong
	 * @param fields Fields yang kosong (optional)
	 * @returns Response object untuk method chaining
	 */
	badRequestInputEmpty(fields?: string[]): Response {
		const message = 'Ada input yang kosong';
		return this.send(400, {
			message,
			errors: fields ? { fields } : undefined
		});
	}

	/**
	 * Mengirim respons 401 Unauthorized dengan pesan kustom
	 * @param message Pesan error yang akan ditampilkan (default: 'Unauthorized')
	 * @returns Response object untuk method chaining
	 */
	unauthorized(message: string = 'Unauthorized'): Response {
		return this.send(401, { message });
	}

	/**
	 * Mengirim respons 403 Forbidden dengan pesan kustom
	 * @param message Pesan error yang akan ditampilkan (default: 'Forbidden')
	 * @returns Response object untuk method chaining
	 */
	forbidden(message: string = 'Forbidden'): Response {
		return this.send(403, { message });
	}

	/**
	 * Mengirim respons 404 Not Found dengan pesan kustom
	 * @param message Pesan error yang akan ditampilkan (default: 'Resource not found')
	 * @param resource Nama resource yang tidak ditemukan (optional)
	 * @returns Response object untuk method chaining
	 */
	notFound(message: string = 'Resource not found', resource?: string): Response {
		return this.send(404, {
			message,
			errors: resource ? { resource } : undefined
		});
	}

	/**
	 * Mengirim respons 404 Not Found khusus untuk user tidak ditemukan
	 * @param userId ID user yang tidak ditemukan (optional)
	 * @returns Response object untuk method chaining
	 */
	userNotFound(userId?: string | number): Response {
		return this.send(404, {
			message: 'User tidak ditemukan',
			errors: userId ? { userId } : undefined
		});
	}

	/**
	 * Mengirim respons 409 Conflict dengan pesan kustom
	 * @param message Pesan error yang akan ditampilkan (default: 'Conflict')
	 * @param fields Fields yang konflik (optional)
	 * @returns Response object untuk method chaining
	 */
	conflict(message: string = 'Conflict', fields?: string[]): Response {
		return this.send(409, {
			message,
			errors: fields ? { fields } : undefined
		});
	}

	/**
	 * Mengirim respons 409 Conflict untuk username/email duplikat
	 * @param fields Fields yang duplikat (optional: 'username', 'email', atau keduanya)
	 * @returns Response object untuk method chaining
	 */
	conflictUsernameOrEmailExists(fields?: ('username' | 'email')[]): Response {
		return this.send(409, {
			message: 'Username atau Email sudah digunakan',
			errors: fields ? { fields } : undefined
		});
	}

	/**
	 * Mengirim respons 422 Unprocessable Entity dengan pesan dan errors
	 * @param message Pesan error yang akan ditampilkan
	 * @param errors Detail validasi errors
	 * @returns Response object untuk method chaining
	 */
	validationError(message: string = 'Validation failed', errors?: any): Response {
		return this.send(422, { message, errors });
	}

	/**
	 * Mengirim respons 429 Too Many Requests
	 * @param message Pesan error yang akan ditampilkan (default: 'Too many requests')
	 * @param retryAfter Waktu tunggu dalam detik sebelum mencoba lagi (optional)
	 * @returns Response object untuk method chaining(this)
	 */
	tooManyRequests(message: string = 'Too many requests', retryAfter?: number): Response {
		const res = this.send(429, { message });
		if (retryAfter) {
			res.set('Retry-After', retryAfter.toString());
		}
		return res;
	}

	/**
	 * Mengirim respons 500 Internal Server Error
	 * @param message Pesan error yang akan ditampilkan (default: 'Internal server error')
	 * @param error Error object untuk logging (tidak dikirim ke client)
	 * @returns Response object untuk method chaining
	 */
	internalServerError(message: string = 'Internal server error', error?: Error): Response {
		if (error) {
			// Log error tapi tidak mengirimkannya ke client
			console.error('[Internal Server Error]', error);
		}
		return this.send(500, { message });
	}

	/**
	 * Mengirim respons dengan status code dan data yang ditentukan
	 * @param statusCode HTTP status code
	 * @param data Data yang akan dikirim (object atau string)
	 * @returns Response object untuk method chaining
	 */
	custom(statusCode: number, data: any | string): Response {
		if (typeof data === 'string') {
			return this.send(statusCode, { message: data });
		}
		return this.send(statusCode, { data });
	}
}

// Factory function untuk membuat instance HttpResponse
export const createHttpResponse = (res: Response): HttpResponse => new HttpResponse(res);
