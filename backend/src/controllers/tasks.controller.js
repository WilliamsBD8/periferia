import { prisma } from "../config/prisma/prisma.js";

import { createNotificationService, sendNotificationService } from "../config/services/notification.service.js";

import { successResponse } from "../config/interfaces/success.js";

export const createTask = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { title, description, notes, expirationDate, order, assignedToUserId } = req.validated;
        const task = await prisma.tasks.create({
            data: { title, description, notes, expirationDate, order, assignedToUserId, userId },
            include: { user: { select: { id: true, name: true } }, assignedToUser: { select: { id: true, name: true } } }
        });
        const notification = await createNotificationService({ title: "Asignación de tarea", message: `Has sido asignado a la tarea ${task.title}`, taskId: task.id });
        await sendNotificationService({ notification });
        return res.status(201).json(successResponse("Tarea creada exitosamente", task, 201));
    } catch (error) {
        console.log(error, "Error");
        error.message = "Error al crear tarea";
        next(error);
    }
}

export const getTasks = async (req, res, next) => {
    try {
        const { userId } = req.user;
        let { page = 1, limit = 10, all = "false" } = req.query;

        page = parseInt(page);
        limit = Math.min(parseInt(limit), 100);
        all = all === "true";

        const where = { OR: [{ userId }, { assignedToUserId: userId }], deletedAt: null };
        const orderBy = { updatedAt: "desc" };
        let query = {
            where,
            include: { user: { select: { id: true, name: true } }, assignedToUser: { select: { id: true, name: true } } },
            orderBy
        }

        if(!all) {
            query.skip = (page - 1) * limit;
            query.take = limit;
        }

        const [data, total] = await Promise.all([
            prisma.tasks.findMany(query),
            prisma.tasks.count({ where })
        ]);
        return res.status(200).json(successResponse("Tareas obtenidas exitosamente", {
            data,
            pagination: {
                total,
                page,
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        }, 200));
    } catch (error) {
        error.message = "Error al obtener tareas";
        console.log(error, "Error");
        next(error);
    }
}

export const getTask = async (req, res, next) => {
    try {
        let { taskId } = req.params;
        taskId = parseInt(taskId);
        const task = await prisma.tasks.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { user: { select: { id: true, name: true } }, assignedToUser: { select: { id: true, name: true } } }
        });
        return res.status(200).json(successResponse("Tarea obtenida exitosamente", task, 200));
    } catch (error) {
        console.log(error, "Error");
        error.message = "Error al obtener tarea";
        next(error);
    }
}

export const updateTask = async (req, res, next) => {
    try {
        let { taskId } = req.params;
        taskId = parseInt(taskId);
        const { title, description, expirationDate, order, assignedToUserId, status } = req.validated;

        const oldTask = await prisma.tasks.findFirst({
            where: { id: taskId, deletedAt: null }
        });

        const task = await prisma.tasks.update({
            where: { id: taskId, deletedAt: null },
            data: { title, description, expirationDate, order, assignedToUserId, status },
            include: { user: { select: { id: true, name: true } }, assignedToUser: { select: { id: true, name: true } } }
        });

        if(oldTask.assignedToUserId !== assignedToUserId) {
            const notification = await createNotificationService({ title: "Asignación de tarea", message: `Has sido asignado a la tarea ${task.title}`, taskId: task.id });
            await sendNotificationService({ notification });
        }else if(oldTask.status !== status) {
            const notification = await createNotificationService({ title: "Estado de tarea", message: `El estado de la tarea ${task.title} ha sido actualizado a ${status}`, taskId: task.id });
            await sendNotificationService({ notification });
        }

        return res.status(200).json(successResponse("Tarea actualizada exitosamente", task, 200));
    } catch (error) {
        console.log(error, "Error");
        error.message = "Error al actualizar tarea";
        next(error);
    }
}

export const updateStateTask = async (req, res, next) => {
    try {
        let { taskId } = req.params;
        taskId = parseInt(taskId);
        const { status } = req.validated;
        const task = await prisma.tasks.update({
            where: { id: taskId, status: { not: status }, deletedAt: null },
            data: { status },
            include: { user: { select: { id: true, name: true } }, assignedToUser: { select: { id: true, name: true } } }
        });
        const notification = await createNotificationService({ title: "Estado de tarea", message: `El estado de la tarea ${task.title} ha sido actualizado a ${status}`, taskId: task.id });
        await sendNotificationService({ notification });
        return res.status(200).json(successResponse("Estado de tarea actualizado exitosamente", task, 200));
    } catch (error) {
        console.log(error, "Error");
        error.message = "Error al actualizar estado de tarea";
        next(error);
    }
}

export const deleteTask = async (req, res, next) => {
    try {
        let { taskId } = req.params;
        taskId = parseInt(taskId);
        const task = await prisma.tasks.update({ where: { id: taskId, deletedAt: null }, data: { deletedAt: new Date() } });
        return res.status(200).json(successResponse("Tarea eliminada exitosamente", task, 200));
    } catch (error) {
        error.message = "Error al eliminar tarea";
        next(error);
    }
}