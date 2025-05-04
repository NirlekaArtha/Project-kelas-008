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
		'POSTGRES_HOST'
	];
	const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

	if (missingEnvVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
	}
};

validateEnv()

type AppConfig = {
	port: number;
	environment: string;
	isProduction: string;
	isDevelopment: string;
	accessTokenSecret: string;
	refreshTokenSecret: string;
	accessTokenExpired: string;
	refreshTokenExpired: string;
	refreshTokenCookieName: string;
}

type DatabaseConfig = {
	port: number;
	host: string;
	username: string;
	password: string;
	database: string;
}

export const config: AppConfig = {
	port: parseInt(process.env.PORT!, 10),
	environment: process.env.NODE_ENV!,
	isProduction: process.env.NODE_ENV || 'production',
	isDevelopment: process.env.NODE_ENV || 'development',
	accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
	refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
	accessTokenExpired: process.env.ACCESS_TOKEN_EXPIRED!,
	refreshTokenExpired: process.env.REFRESH_TOKEN_EXPIRED!,
	refreshTokenCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME!,
};

export const dbConfig: DatabaseConfig = {
	host: process.env.POSTGRES_HOST!,
	port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
	username: process.env.POSTGRES_USERNAME!,
	password: process.env.POSTGRES_PASSWORD!,
	database: process.env.POSTGRES_DB!,
};
