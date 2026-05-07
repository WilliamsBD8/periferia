import express from "express";
import { getUsers } from "../controllers/users.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const usersRouter = express.Router();
usersRouter.get("/", authenticate, getUsers);

export default usersRouter;