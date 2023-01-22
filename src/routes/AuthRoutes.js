import { signin, signup } from "../controller/Authentication.js"
import { Router } from "express";
import { signInSchema, signUpSchema } from "../schema/userSchema.js";
import validateAsync from "../middleware/validateAsync.js";

const authRouter = Router();

authRouter.post("/signin", validateAsync(signInSchema), signin);

authRouter.post("/signup", validateAsync(signUpSchema), signup);

export default authRouter;