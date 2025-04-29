import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { SafeUser } from '../models/user';
import { config } from "../../configs/configs";
import { HttpResponse } from "../helpers/http-responses";

export const generateAccessToken = (username: any) => {
	jwt.sign(username, config.token_secret, { expiresIn: '1800s' });
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

	jwt.verify(token, config.token_secret as string, (err, decode) => {
		console.log(err);

		if (err) {
			httpResponse.forbidden();
		}

		const data = <Pick<SafeUser, 'username'>>(decode as SafeUser);
		req.body.username = data.username;

		next();
	});
}
