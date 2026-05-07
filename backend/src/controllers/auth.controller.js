import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma/prisma.js";

import { successResponse } from "../config/interfaces/success.js";
import { errorResponse } from "../config/interfaces/errors.js";

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.validated;
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { role: { select: { id: true, name: true } } }
        });
        if (!user) {
            return res.status(401).json(errorResponse("Credenciales incorrectas", null, 401));
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json(errorResponse("Credenciales incorrectas", null, 401));
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "3600") });
        return res.status(200).json(successResponse("Inicio de sesión exitoso", { token, user }, 200));
    } catch (error) {
        error.message = "Error al iniciar sesión";
        next(error);
    }
}

export const register = async (req, res, next) => {
    try {
        const { name, email, password, roleId = 3 } = req.validated;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword, roleId } });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "3600") });
        return res.status(201).json(successResponse("Usuario registrado exitosamente", { token }, 201));
    } catch (error) {
        error.message = "Error al registrar usuario";
        next(error);
    }
}

export const logout = async (req, res, next) => {
    try {
        const { userId } = req.user;
        await prisma.tokensUser.deleteMany({ where: { userId } });
        return res.status(200).json(successResponse("Sesión cerrada exitosamente", null, 200));
    } catch (error) {
        error.message = "Error al cerrar sesión";
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const user = await prisma.user.findFirst(
            {
                where: { id: userId, deletedAt: null },
                select: { id: true, name: true, email: true, role: { select: { id: true, name: true } } }
            }
        );
        if (!user) {
            return res.status(401).json(errorResponse("Usuario no encontrado", null, 401));
        }
        return res.status(200).json(successResponse("Usuario obtenido exitosamente", user, 200));
    } catch (error) {
        error.message = "Error al obtener usuario";
        next(error);
    }
}