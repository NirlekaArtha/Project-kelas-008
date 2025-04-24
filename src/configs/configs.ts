import dotenv from 'dotenv';

dotenv.config()

const validateEnv = (): void => {
	const requiredEnvVars = ['PORT', 'NODE_ENV', 'POSTGRES_USERNAME', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'POSTGRES_HOST'];
	const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

	if (missingEnvVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
	}
};

export const config = {
	port: parseInt(process.env.PORT || '3001', 10),
	node_env: process.env.NODE_ENV || 'development',
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development'
}

export const pgConfig = {
	port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
	host: process.env.POSTGRES_HOST,
	username: process.env.POSTGRES_USERNAME,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
}

validateEnv()
