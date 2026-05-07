import express from "express";
import { createTask, getTasks, getTask, updateTask, updateStateTask, deleteTask } from "../controllers/tasks.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

import { createTaskSchema } from "../schemas/tasks/create.schema.js";
import { updateTaskSchema } from "../schemas/tasks/update.schema.js";
import { updateStateTaskSchema } from "../schemas/tasks/state.schema.js";

const tasksRouter = express.Router();

tasksRouter.post("/", authenticate, validate(createTaskSchema), createTask);
tasksRouter.get("/", authenticate, getTasks);
tasksRouter.get("/:taskId", authenticate, getTask);
tasksRouter.put("/:taskId", authenticate, validate(updateTaskSchema), updateTask);
tasksRouter.put("/:taskId/state", authenticate, validate(updateStateTaskSchema), updateStateTask);
tasksRouter.delete("/:taskId", authenticate, deleteTask);

export default tasksRouter;