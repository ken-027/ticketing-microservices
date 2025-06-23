import type { User } from "@ksoftdev/core";
import { z, ZodTypeAny } from "zod";

export const signup = z
    .object<Record<keyof Omit<User, "id">, ZodTypeAny>>({
        email: z.string().email().trim(),
        password: z.string().trim().max(16).min(4),
    })
    .required();
