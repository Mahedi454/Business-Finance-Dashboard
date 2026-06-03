import type { NextFunction, Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env, isProduction } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "./error.js";
import { AUTH_COOKIE } from "../utils/constants.js";

export type AuthPayload = {
  sub: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number;
        name: string;
        email: string;
      };
    }
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

export function signAuthToken(payload: AuthPayload) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[AUTH_COOKIE];
    if (!token) throw new ApiError(401, "Authentication required");

    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    const admin = await prisma.adminUser.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, name: true, email: true },
    });

    if (!admin) throw new ApiError(401, "Invalid session");
    req.admin = admin;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(401, "Invalid session"));
  }
}
