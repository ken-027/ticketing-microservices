import express from "express";
import { getCurrentUser } from "../controllers/user.controller";
import { authentication } from "@ksoftdev/core";

const userRouter = express.Router();

userRouter.get("/users/current", authentication, getCurrentUser);

export default userRouter;
