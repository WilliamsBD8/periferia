import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { errorResponse } from "../config/interfaces/errors.js";

function errorMiddleware(err, req, res, next) {
    console.error(err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {

        if (err.code === "P2002") {
            let fields = [];
            
            if (err.meta?.target) {
                fields = err.meta.target;
            }else if (err.meta?.driverAdapterError) {
                fields = [err.meta.driverAdapterError.cause.constraint.fields];
            }
            return res.status(400).json(
                errorResponse(`Ya existe un registro con los campos únicos: ${fields.join(", ")}`, req.validated, 400)
            );
        }

        if (err.code === "P2025") {
            return res.status(404).json(
                errorResponse("El registro no existe", null, 404)
            );
        }

        if (err.code === "P2003") {
            const foreignKeyErrors = {
                "users_roleId_fkey": "El rol no existe",
                "tasks_user_id_fkey": "El usuario creador no existe",
                "tasks_assigned_to_user_id_fkey": "El usuario asignado no existe",
            };

            const message = foreignKeyErrors[err.meta?.constraint] || "Relación inválida";

            return res.status(400).json(
                errorResponse(message, null, 400)
            );
        }
    }

    if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json(
            errorResponse("El token ha expirado", null, 401)
        );
    }
    
    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(
            errorResponse("Token inválido", null, 401)
        );
    }

    // Error personalizado (si tú lanzas throw new Error())
    if (err.message) {
        return res.status(400).json(
            errorResponse(err.message, null, 400)
        );
    }

    return res.status(500).json(
        errorResponse(err.message || "Error interno del servidor", null, 500)
    );
}

export default errorMiddleware;