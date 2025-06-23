import { Request, Response } from "express";
import { User } from "@ksoftdev/core";
import UserModel from "../models/user.model";
import { HTTPCodes } from "@ksoftdev/core";
import { JWT } from "@ksoftdev/core";

export async function signIn(
    req: Request<{}, {}, Omit<User, "id">>,
    res: Response,
) {
    const { email, password } = req.body;

    const user = await UserModel.signIn(email, password);

    const jwtToken = JWT.sign(user);

    req.session ||= {};
    req.session.accessToken = jwtToken;

    res.send({ user, jwtToken });
}

export async function signUp(
    req: Request<{}, {}, Omit<User, "id">>,
    res: Response,
) {
    const { email, password } = req.body;

    await UserModel.checkEmailIfExists(email);

    const payload = await UserModel.createUser({
        email,
        password,
    });

    const jwtToken = JWT.sign(payload);

    req.session = {
        accessToken: jwtToken,
    };

    res.status(HTTPCodes.Created).send({
        user: payload,
        jwtToken,
    });
}

export function signOut(req: Request, res: Response) {
    req.session = null;

    res.send({ message: "signout successfully" });
}
