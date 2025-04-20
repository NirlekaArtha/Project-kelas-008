import dotenv from 'dotenv'

const envPath = process.env.PORT;

dotenv.config({path: envPath});

const validateEnv = () => {
	if (!process.env.PORT) {
		throw new Error('Port is not define in env')
	}
}

export const config = {
	port: parseInt(process.env.PORT || '3001', 10),
	env: process.env.NODE_ENV || 'development',
	isProduction: process.env.NODE_ENV === 'production',
	isDevelopment: process.env.NODE_ENV === 'development'
}

validateEnv()
