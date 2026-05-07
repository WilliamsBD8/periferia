import { prisma } from "../config/prisma/prisma.js";

import { successResponse } from "../config/interfaces/success.js";

export const getUsers = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, all = "false" } = req.query;

        page = parseInt(page);
        limit = Math.min(parseInt(limit), 100);
        all = all === "true";

        const where = { deletedAt: null };
        const orderBy = { createdAt: "desc" };
        let query = {
            where,
            include: { role: { select: { id: true, name: true } } },
            orderBy
        }

        if(!all) {
            query.skip = (page - 1) * limit;
            query.take = limit;
        }

        const [data, total] = await Promise.all([
            prisma.user.findMany(query),
            prisma.user.count({ where })
        ]);
        return res.status(200).json(successResponse("Usuarios obtenidos exitosamente", {
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