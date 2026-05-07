import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().min(1, "El email es requerido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    roleId: z.number().int().positive().optional(),
});