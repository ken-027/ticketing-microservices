import express from "express";
import {
    getTicket,
    getTickets,
    newTicket,
    updateTicket,
} from "../controllers/ticket.controller";
import { ticket } from "../schema-validation/ticket.schema";
import { authentication, validateRequest } from "@ksoftdev/core";

const ticketRouter = express.Router();

ticketRouter.get("/:ticketId", getTicket);
ticketRouter.get("/", getTickets);
ticketRouter.post(
    "/",
    authentication,
    validateRequest(ticket, "body"),
    newTicket,
);
ticketRouter.put(
    "/:ticketId",
    authentication,
    validateRequest(ticket, "body"),
    updateTicket,
);

export default ticketRouter;
