import express from "express";
import {
    getOrder,
    getOrders,
    newOrder,
    deleteOrder,
} from "../controllers/order.controller";
import { order, orderParam } from "../schema-validation/order.schema";
import { authentication, validateRequest } from "@ksoftdev/core";

const orderRouter = express.Router();

orderRouter.get(
    "/:orderId",
    authentication,
    validateRequest(orderParam, "params"),
    getOrder,
);
orderRouter.delete(
    "/:orderId",
    authentication,
    validateRequest(orderParam, "params"),
    deleteOrder,
);
orderRouter.get("/", authentication, getOrders);
orderRouter.post("/", authentication, validateRequest(order, "body"), newOrder);

export default orderRouter;
