export interface SafeUser {
	id: number;
	username: string;
	email: string;
	jabatan: string;
	deskripsi: string;
	is_admin: boolean;
	is_active: boolean;
	created_at: Date;
	updated_at: Date;
}

export interface UserWithPassword extends SafeUser {
	password: string;
}

export const DummyUser: UserWithPassword = {
	id: 99,
	username: 'pitraBaka',
	password: 'pass',
	email: 'pitra@email.com',
	jabatan: 'keamanan',
	deskripsi: 'Lu mah enak',
	is_admin: false,
	is_active: true,
	created_at: new Date(),
	updated_at: new Date(),
}
