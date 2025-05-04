import dotenv from 'dotenv';

dotenv.config()

const validateEnv = (): void => {
	const requiredEnvVars = [
		'PORT',
		'NODE_ENV',
		'ACCESS_TOKEN_SECRET',
		'REFRESH_TOKEN_SECRET',
		'ACCESS_TOKEN_EXPIRED',
		'REFRESH_TOKEN_EXPIRED',
		'REFRESH_TOKEN_COOKIE_NAME',
		'POSTGRES_USERNAME',
		'POSTGRES_PASSWORD',
		'POSTGRES_DB',
		'POSTGRES_HOST'];
	const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

	if (missingEnvVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
	}
};

interface Config {
	port: number;
	node_env: string;
	isProduction: string;
	isDevelopment: string;
	access_token_secret: string;
	refresh_token_secret: string;
	access_token_expired: string;
	refresh_token_expired: string;
	refresh_token_cookie_name: string;
}

interface PGConfig {
	port: number;
	host: string;
	username: string;
	password: string;
	database: string;
}

export const config: Config = {
	port: parseInt(process.env.PORT || '3001', 10),
	node_env: process.env.NODE_ENV || 'development',
	isProduction: process.env.NODE_ENV || 'production',
	isDevelopment: process.env.NODE_ENV || 'development',
	access_token_secret: process.env.ACCESS_TOKEN_SECRET || '',
	refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || '',
	access_token_expired: process.env.ACCESS_TOKEN_EXPIRED || '',
	refresh_token_expired: process.env.REFRESH_TOKEN_EXPIRED || '',
	refresh_token_cookie_name: process.env.REFRESH_TOKEN_COOKIE_NAME || '',
}

export const pgConfig: PGConfig = {
	port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
	host: process.env.POSTGRES_HOST || 'localhost',
	username: process.env.POSTGRES_USERNAME || 'postgres',
	password: process.env.POSTGRES_PASSWORD || '',
	database: process.env.POSTGRES_DB || '',
}

validateEnv()
