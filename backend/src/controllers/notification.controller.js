import { prisma } from "../config/prisma/prisma.js";

import { successResponse } from "../config/interfaces/success.js";

export const getNotifications = async (req, res, next) => {
    try {
        const { userId } = req.user;
        let { page = 1, limit = 10, all = "false" } = req.query;

        page = parseInt(page, 10);
        limit = Math.min(parseInt(limit, 10), 100);
        all = all === "true";

        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }
        if (Number.isNaN(limit) || limit < 1) {
            limit = 10;
        }

        const where = {
            task: {
                OR: [{ userId }, { assignedToUserId: userId }]
            },
            deletedAt: null
        };
        const orderBy = { createdAt: "desc" };
        let query = {
            where,
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                        user: { select: { id: true, name: true } },
                        assignedToUser: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy
        }
        
        if(!all) {
            query.skip = (page - 1) * limit;
            query.take = limit;
        }

        const [data, total] = await Promise.all([
            prisma.notifications.findMany(query),
            prisma.notifications.count({ where })
        ]);

        const unread = await prisma.notifications.count({
            where: {
                task: {
                    OR: [{ userId }, { assignedToUserId: userId }]
                },
                deletedAt: null,
                isRead: false
            }
        });

        return res.status(200).json(successResponse("Notificaciones obtenidas exitosamente", {
            data,
            pagination: {
                total,
                page,
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(total / parseInt(limit, 10))
            },
            unread
        }, 200));

    } catch (error) {
        console.log(error, "Error");
        error.message = "Error al obtener notificaciones";
        next(error);
    }
}

export const createNotification = async (req, res, next) => {
    try {
        const { title, message, userId } = req.validated;
        const notification = await prisma.notifications.create({
            data: { title, message, userId },
        });
    }catch (error) {
        console.log(error, "Error");
        error.message = "Error al crear notificación";
        next(error);
    }
}

export const updateNotification = async (req, res, next) => {
    try {
        let { id } = req.params;
        id = parseInt(id, 10);
        const { userId } = req.user;
        const { isRead } = req.validated;

        const notificationFound = await prisma.notifications.findFirst({
            where: {
                id,
                deletedAt: null,
                task: {
                    OR: [{ userId }, { assignedToUserId: userId }]
                }
            }
        });

        if (!notificationFound) {
            return res.status(404).json({
                message: "Notificación no encontrada"
            });
        }

        const notification = await prisma.notifications.update({
            where: { id },
            data: { isRead },
        });
        return res.status(200).json(successResponse("Notificación actualizada exitosamente", notification, 200));
    } catch (error) {
        console.log(error, "Error");
        error.message = "Error al actualizar notificación";
        next(error);
    }
}

export const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const result = await prisma.notifications.updateMany({
            where: {
                task: {
                    OR: [{ userId }, { assignedToUserId: userId }]
                },
                deletedAt: null,
                isRead: false
            },
            data: { isRead: true }
        });

        return res.status(200).json(
            successResponse("Notificaciones marcadas como leídas", { updated: result.count }, 200)
        );
    } catch (error) {
        console.log(error, "Error");
        error.message = "Error al marcar notificaciones como leídas";
        next(error);
    }
}