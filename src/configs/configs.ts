import dotenv from 'dotenv';

dotenv.config()

const validateEnv = (): void => {
	const requiredEnvVars = ['PORT', 'NODE_ENV', 'TOKEN_SECRET', 'POSTGRES_USERNAME', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'POSTGRES_HOST'];
	const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

	if (missingEnvVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
	}
};

interface Config {
	port: number;
	node_env: string;
	token_secret: string;
	isProduction: string;
	isDevelopment: string;
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
	token_secret: process.env.TOKEN_SECRET || '',
	isProduction: process.env.NODE_ENV || 'production',
	isDevelopment: process.env.NODE_ENV || 'development'
}

export const pgConfig: PGConfig = {
	port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
	host: process.env.POSTGRES_HOST || 'localhost',
	username: process.env.POSTGRES_USERNAME || 'postgres',
	password: process.env.POSTGRES_PASSWORD || '',
	database: process.env.POSTGRES_DB || '',
}

validateEnv()
