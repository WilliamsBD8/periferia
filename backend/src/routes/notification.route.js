import express from "express";
import { getNotifications, markAllNotificationsAsRead, updateNotification } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateNotificationSchema } from "../schemas/notifications/update.schema.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authenticate, getNotifications);
notificationRouter.put("/read-all", authenticate, markAllNotificationsAsRead);
notificationRouter.put("/:id", authenticate, validate(updateNotificationSchema), updateNotification);

export default notificationRouter;