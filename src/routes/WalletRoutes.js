import { getWallet, postWallet } from "../controller/Wallet.js";
import { Router } from "express";
import tokenCheck from "../middleware/tokenCheck.js";
import { transactionSchema } from "../schema/walletSchema.js";
import validateAsync from "../middleware/validateAsync.js";

const walletRouter = Router();

walletRouter.get("/wallet", getWallet);

walletRouter.post("/wallet", tokenCheck(), validateAsync(transactionSchema), postWallet);

export default walletRouter;