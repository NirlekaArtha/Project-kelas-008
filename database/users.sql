CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	username VARCHAR(75) UNIQUE NOT NULL,
	khodam VARCHAR(30),
	email VARCHAR(254) UNIQUE NOT NULL,
	password TEXT NOT NULL,
	jabatan VARCHAR(25) NOT NULL,
	deskripsi TEXT,
	is_admin boolean,
	is_active boolean,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
