import mongoose, { Model, Schema, model } from "mongoose";
import { OrderStatus, type Order, type OrderDoc } from "@ksoftdev/core";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderFunctions {
    newOrder(order: Order): Promise<OrderDoc>;
}

const orderSchema = new Schema<OrderDoc>(
    {
        expiresAt: { type: mongoose.Schema.Types.Date, required: true },
        userId: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
        },
    },
    {
        toJSON: {
            transform: (_doc, ret) => {
                ret.id = ret._id;
                delete ret.__v;
                delete ret._id;
            },
        },
        timestamps: true,
    },
);

orderSchema.static("newOrder", async (order: Order) => {
    const createdOrder = await new OrderModel(order);

    await createdOrder.save();
    return createdOrder;
});
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

const OrderModel = model<OrderDoc, Model<OrderDoc> & OrderFunctions>(
    "Order",
    orderSchema,
);

export default OrderModel;
