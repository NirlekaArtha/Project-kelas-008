import dotenv from 'dotenv';
import { Pool, PoolConfig } from 'pg';

dotenv.config();

const dbConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt('5432'),
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  // ssl: process.env.DB_SSL === 'true' ? {
  //   rejectUnauthorized: false 
  // } : false,
  max: 20,
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000 
};

const validateDbConfig = (): void => {
  const requiredEnvVars = ['POSTGRES_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required database environment variables: ${missingEnvVars.join(', ')}`);
  }
};

const createDbPool = (): Pool => {
  try {
    validateDbConfig();
    const pool = new Pool(dbConfig);
    
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
