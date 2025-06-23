import { Model, Schema, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import type { OrderPayment, OrderPaymentDoc } from "@ksoftdev/core";

interface OrderPaymentFunctions {
    newOrder(ticket: OrderPayment): Promise<OrderPaymentDoc>;
    findPreviousVersion: (
        id: string,
        version: number,
    ) => Promise<OrderPaymentDoc | null>;
}

const orderPaymentSchema = new Schema<OrderPaymentDoc>(
    {
        userId: { type: String, required: true },
        price: { type: Number, required: true },
        status: { type: String, required: true },
    },
    {
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
        timestamps: true,
    },
);

orderPaymentSchema.set("versionKey", "version");
orderPaymentSchema.plugin(updateIfCurrentPlugin);

orderPaymentSchema.static("newOrder", async (orderPayment: OrderPayment) => {
    const { id: _id, userId, price, status } = orderPayment;

    const createdTicket = await new OrderPaymentModel({
        _id,
        userId,
        price,
        status,
    });

    await createdTicket.save();
    return createdTicket;
});

orderPaymentSchema.static(
    "findPreviousVersion",
    async function (id: string, version: number) {
        const orderPayment = await OrderPaymentModel.findOne({
            _id: id,
            version: version - 1,
        });

        return orderPayment;
    },
);

const OrderPaymentModel = model<
    OrderPaymentDoc,
    Model<OrderPaymentDoc> & OrderPaymentFunctions
>("OrderPayment", orderPaymentSchema);

export default OrderPaymentModel;
