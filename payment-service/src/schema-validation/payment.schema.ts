import mongoose from "mongoose";
import { z, ZodTypeAny } from "zod";

export interface Payment {
    token: string;
    orderId: string;
}

export const payment = z
    .object<Record<keyof Omit<Payment, "userId">, ZodTypeAny>>({
        orderId: z
            .string()
            .trim()
            .refine((ticketId) => mongoose.Types.ObjectId.isValid(ticketId), {
                message: "Invalid id format",
            }),
        token: z.string().trim(),
    })
    .required();
