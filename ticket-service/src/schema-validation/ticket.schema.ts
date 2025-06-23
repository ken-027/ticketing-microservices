import type { Ticket } from "@ksoftdev/core";
import { z, ZodTypeAny } from "zod";

export const ticket = z
    .object<Record<keyof Omit<Ticket, "userId">, ZodTypeAny>>({
        title: z.string().trim(),
        price: z.number().min(0.1),
    })
    .required();
