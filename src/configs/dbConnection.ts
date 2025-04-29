import { pgConfig } from './configs'
import pg from 'pg';

const dbConfig = new pg.Pool({
	user: pgConfig.username,
	password: pgConfig.password,
	database: pgConfig.database,
	host: pgConfig.host,
	port: pgConfig.port,
	max: 20,
	idleTimeoutMillis: 1000,
	connectionTimeoutMillis: 1000,
	maxUses: 7500,
});

const createDbPool = () => {
	try {
		const pool = dbConfig;
		
		pool.on('error', (err) => {
			console.error('Unexpected error on idle client', err);
			process.exit(-1);
		});

		return pool;
	} catch (error) {
		console.error('Database configuration error:', error);
		throw error;
	} 
};

const pool = createDbPool();

export const testDbConnection = async (): Promise<boolean> => {
	const client = await pool.connect();
	try {
		await client.query('SELECT NOW()');
		return true;
	} catch (error) {
		console.error('Database connection test failed:', error);
		return false;
	} finally {
		client.release();
	}
};

export default pool;
