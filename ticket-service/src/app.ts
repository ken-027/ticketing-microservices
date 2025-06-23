import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";

import { json } from "body-parser";
import { errorHandler, NotFound } from "@ksoftdev/core";
import { NODE_ENV } from "./config/env";
import ticketRouter from "./routes/ticket.route";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
    cookieSession({
        secure: NODE_ENV !== "test",
        signed: false,
    }),
);

const apiPrefix = "/api/v1/tickets";

app.use(`${apiPrefix}`, ticketRouter);

app.all("*", NotFound);
app.use(errorHandler);

export default app;
