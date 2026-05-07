import jwt from "jsonwebtoken";
import { errorResponse } from "../config/interfaces/errors.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json(errorResponse("Formato del token inválido. Se requiere Bearer token.", null, 401));
    }
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json(errorResponse("No autorizado", null, 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
}