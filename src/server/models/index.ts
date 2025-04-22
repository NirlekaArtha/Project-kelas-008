import pgp from 'pg-promise';
import * as dotenv from 'dotenv';

// Load environment variables dari file .env
dotenv.config();

// Periksa environment variables
console.log('Checking environment variables:');
console.log('USER:', process.env.POSTGRES_USERNAME);
console.log('DB:', process.env.POSTGRES_DB);

// Buat connection string yang benar
const connectionString = `postgres://tplp008:"V@Cv*3UyNWwJdwtxeUMe":5432/tplp008_db`;

const db = pgp()(connectionString);

db.one('SELECT * FROM users WHERE id = $1', 123)
  .then((data: { value: any }) => {
    console.log('DATA:', data.value);
  })
  .catch((error: any) => {
    console.log('ERROR:', error);
  });
