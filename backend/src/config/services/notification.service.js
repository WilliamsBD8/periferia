import "dotenv/config";
import { prisma } from "../prisma/prisma.js";

import { Resend } from "resend";
const resend = new Resend(process.env.API_RESEND_KEY);

export const createNotificationService = async ({ title, message, taskId }) => {
    return await prisma.notifications.create({
      data: { title, message, taskId },
      include: { task: { select: { id: true, title: true, user: { select: { id: true, email: true } } } } }
    });
};

export const sendNotificationService = async ({ notification }) => {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: notification.task.user.email,
      subject: notification.title,
      html: notification.message,
    });
    console.log(response, "Response");
    return response;
};