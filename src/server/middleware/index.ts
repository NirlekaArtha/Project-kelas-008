import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { SafeUser, UserWithPassword } from '../models/user';
import { config } from "../../configs/configs";
import { HttpResponse } from "../helpers/http-responses";

export const generateAccessToken = (payload: object) => {
	const secret = config.access_token_secret;

	if (!secret) {
		throw new Error("JWT_SECRET environment variable not defined!");
	}

	jwt.sign(payload, secret, { expiresIn: '4h' });
	return;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const httpResponse = new HttpResponse(res);

	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		httpResponse.unauthorized();
		return;
	}

	jwt.verify(token, config.access_token_secret as string, (err, decode) => {
		console.log(err);

		if (err) {
			httpResponse.forbidden();
		}

		const data = <Pick<SafeUser, 'username'>>(decode as SafeUser);
		req.body.username = data.username;

		next();
	});
}
