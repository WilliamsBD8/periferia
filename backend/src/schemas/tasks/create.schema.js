import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().min(1, "El título es requerido"),
    description: z.string().optional(),
    expirationDate: z.string().optional()
    .transform((val) => (val ? new Date(val) : undefined)),
    order: z.string().optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
    assignedToUserId: z.string().min(1, "El usuario asignado es requerido")
    .transform((val) => (val ? parseInt(val) : undefined)),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
});