import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import { json } from "body-parser";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import { NotFound } from "@ksoftdev/core";
import { errorHandler } from "@ksoftdev/core";
import { NODE_ENV } from "./config/env";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
    cookieSession({
        secure: NODE_ENV !== "test",
        signed: false,
    }),
);

const apiPrefix = "/api/v1/auth";

app.use(`${apiPrefix}`, userRouter);
app.use(`${apiPrefix}`, authRouter);

app.all("*", NotFound);
app.use(errorHandler);

export default app;
