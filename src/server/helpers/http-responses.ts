import { Response } from 'express';

export class HttpResponse {
	private readonly response: Response;

	constructor(res: Response) {
		this.response = res;
	}

	/**
	 * Mengirim respons 400 Bad Request dengan pesan kustom
	 * @param msg Pesan error yang akan ditampilkan
	 * @throws Error jika parameter msg kosong atau bukan string
	 */
	badRequest(msg: string): void {
		if (!msg || typeof msg !== 'string') {
			throw new Error('Parameter msg harus berupa string dan tidak boleh kosong');
		}
		this.response.status(400).json({ message: msg });
	}

	/**
	 * Mengirim respons 400 Bad Request untuk input kosong
	 */
	badRequestInputEmpty(): void {
		this.response.status(400).json({ message: 'Ada input yang kosong' });
	}

	/**
	 * Mengirim respons 409 Conflict untuk username/email duplikat
	 */
	conflictUsernameOrEmailExists(): void {
		this.response.status(409).json({
			message: 'Username atau Email sudah digunakan'
		});
	}

	/**
	 * Mengirim respons 404 Not Found dengan pesan kustom
	 * @param msg Pesan error yang akan ditampilkan
	 * @throws Error jika parameter msg kosong atau bukan string
	 */
	notFound(msg: string): void {
		if (!msg || typeof msg !== 'string') {
			throw new Error('Parameter msg harus berupa string dan tidak boleh kosong');
		}
		this.response.status(404).json({ message: msg });
	}

	/**
	 * Mengirim respons 404 Not Found khusus untuk user tidak ditemukan
	 */
	userNotFound(): void {
		this.response.status(404).json({ message: 'User tidak ditemukan' });
	}

	/**
	 * Mengirim respons 401 invalid/Unauthorized request
	 * @param msg Pesan error yang akan ditampilkan
	 * @throws Error jika parameter kosong atau bukan string
	 */
	invalidRequest(msg: string): void {
		if (!msg || typeof msg !== 'string') {
			throw new Error('Parameter msg harus berupa string dan tidak boleh kosong');
		}
		this.response.status(401).json({ message: msg });
	}

	/**
	 * Mengirim respons 500 Internal Server Error
	 */
	internalServerError(): void {
		this.response.status(500).json({ message: 'Internal server error' });
	}

	/**
	 * Mengirim respons 401 Unauthorized untuk akses tidak dikenal
	 */
	unauthorized(): void {
		this.response.status(401).json({ message: 'Who are you?' });
	}

	/**
	 * Mengirim respons 403 Forbidden untuk akses terlarang
	 */
	forbidden(): void {
		this.response.status(403).json({
			message: 'I know you, but your ass not allow here!'
		});
	}
}
