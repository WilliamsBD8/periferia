import { z } from "zod";

export const updateStateTaskSchema = z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
});