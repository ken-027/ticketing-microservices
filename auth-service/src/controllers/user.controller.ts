import { Request, Response } from "express";
import UserModel from "../models/user.model";
import type { User } from "@ksoftdev/core";

export async function getCurrentUser(req: Request, res: Response) {
    const { email } = req.session?.user as User;

    const currentUser = await UserModel.findOne({ email });

    res.send(currentUser || null);
}
