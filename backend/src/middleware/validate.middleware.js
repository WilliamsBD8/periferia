import { errorResponse } from "../config/interfaces/errors.js";
import { prisma } from "../config/prisma/prisma.js";

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(errorResponse("Errores de validación", result.error.flatten(), 400));
    }
    req.validated = result.data;
    next();
};

export const validatePermissions = (permissions) => async (req, res, next) => {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: { include: { rolePermissions: { include: { permission: true } } } } } });
    if (!user.role.rolePermissions.some(rolePermission => rolePermission.permission.name === permissions)) {
        return res.status(403).json(errorResponse("No tienes permisos para acceder a este recurso", null, 403));
    }
    next();
}