CREATE TABLE blog(
	id SERIAL PRIMARY KEY, 
	header VARCHAR(254),
	image TEXT,
	description TEXT,
	author VARCHAR(75) references users(id), 
	likes INT,
	views INT,
	date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	tag VARCHAR(50),
)
