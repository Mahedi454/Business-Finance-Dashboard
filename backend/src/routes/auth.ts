import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { AUTH_COOKIE } from "../utils/constants.js";
import { ApiError } from "../middleware/error.js";
import { cookieOptions, requireAuth, signAuthToken } from "../middleware/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const admin = await prisma.adminUser.findUnique({ where: { email: data.email } });
    if (!admin || !(await bcrypt.compare(data.password, admin.passwordHash))) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signAuthToken({ sub: String(admin.id), email: admin.email });
    res.cookie(AUTH_COOKIE, token, cookieOptions);
    res.json({ user: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, cookieOptions);
  res.json({ message: "Logged out" });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.admin });
});
