import mongoose from "mongoose";
import { z, ZodTypeAny } from "zod";

export const order = z
    .object<Record<keyof Omit<{ ticketId: string }, "userId">, ZodTypeAny>>({
        ticketId: z
            .string()
            .trim()
            .refine((ticketId) => mongoose.Types.ObjectId.isValid(ticketId), {
                message: "Invalid id format",
            }),
    })
    .required();

export const orderParam = z
    .object<{ orderId: ZodTypeAny }>({
        orderId: z
            .string()
            .trim()
            .refine((ticketId) => mongoose.Types.ObjectId.isValid(ticketId), {
                message: "Invalid id format",
            }),
    })
    .required();
