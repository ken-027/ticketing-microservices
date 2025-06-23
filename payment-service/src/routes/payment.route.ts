import express from "express";
import { newPayment } from "../controllers/payment.controller";
import { payment } from "../schema-validation/payment.schema";
import { authentication, validateRequest } from "@ksoftdev/core";

const paymentRouter = express.Router();

paymentRouter.post(
    "/",
    authentication,
    validateRequest(payment, "body"),
    newPayment,
);
export default paymentRouter;
