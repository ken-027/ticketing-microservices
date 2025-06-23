import { Request, Response } from "express";
import { Payment } from "../schema-validation/payment.schema";
import {
    BadRequestError,
    HTTPCodes,
    natsWrapper,
    NotFoundError,
    OrderStatus,
    UnAuthorizedError,
} from "@ksoftdev/core";
import OrderPaymentModel from "../models/order-payment.model";
import { stripe } from "../../lib/stripe.lib";
import PaymentModel from "../models/payment.model";
import { PaymentCreatedPublisher } from "../events/payment.publisher";

export async function newPayment(req: Request<{}, {}, Payment>, res: Response) {
    const { id: userId } = req.session?.user;
    const { orderId, token } = req.body;

    const orderPayment = await OrderPaymentModel.findById(orderId);

    if (!orderPayment) throw new NotFoundError("order not found");

    if (orderPayment.userId !== userId)
        throw new UnAuthorizedError("you are not authorize to pay this order");

    if (orderPayment.status === OrderStatus.Cancelled)
        throw new BadRequestError("order is cancelled");

    try {
        const charge = await stripe.charges.create({
            currency: "usd",
            amount: orderPayment.price * 100,
            source: token,
        });

        const payment = await PaymentModel.newPayment({
            orderId,
            stripeId: charge.id,
        });

        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(HTTPCodes.Created).json({ payment });
    } catch (err: any) {
        throw new BadRequestError(err.message);
    }
}
