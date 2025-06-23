import express from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller";
import { validateRequest } from "@ksoftdev/core";
import { signup } from "../schema-validation/auth.schema";
import { authentication } from "@ksoftdev/core";

const authRouter = express.Router();

authRouter.post("/signin", validateRequest(signup, "body"), signIn);
authRouter.post("/signout", authentication, signOut);
authRouter.post("/signup", validateRequest(signup, "body"), signUp);

export default authRouter;
