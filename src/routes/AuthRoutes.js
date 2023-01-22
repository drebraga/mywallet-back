import { signin, signup } from "../controller/Authentication.js"
import express from "express";
import { signInSchema, signUpSchema } from "../schema/userSchema.js";
import validateAsync from "../middleware/validateAsync.js";

const authRouter = express.Router();

authRouter.post("/signin", validateAsync(signInSchema), signin);

authRouter.post("/signup", validateAsync(signUpSchema), signup);

export default authRouter;