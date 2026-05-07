import express from "express";
import { login, register, logout, getUser } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { loginSchema } from "../schemas/auth/login.schema.js";
import { registerSchema } from "../schemas/auth/register.schema.js";

const authRouter = express.Router();

authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/user", authenticate, getUser);

export default authRouter;