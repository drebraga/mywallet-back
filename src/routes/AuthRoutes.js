import { signin, signup } from "../controller/Authentication.js"
import express from "express";

const authRouter = express.Router();

authRouter.post("/signin", signin);

authRouter.post("/signup", signup);

export default authRouter;