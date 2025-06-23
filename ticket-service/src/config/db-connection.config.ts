import mongoose from "mongoose";
import { MONGODB_URL } from "./env";

export default async function dbConnect() {
    console.log("initializing db connection...");
    await mongoose.connect(MONGODB_URL);

    console.log("db connected!");
}
