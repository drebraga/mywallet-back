import { getWallet, postWallet, updateWallet, deleteWallet } from "../controller/Wallet.js";
import { Router } from "express";
import tokenCheck from "../middleware/tokenCheck.js";
import { transactionSchema, updateTransactionSchema } from "../schema/walletSchema.js";
import validateAsync from "../middleware/validateAsync.js";

const walletRouter = Router();

walletRouter.get("/wallet", getWallet);

walletRouter.post("/wallet", tokenCheck(), validateAsync(transactionSchema), postWallet);

walletRouter.put("/wallet", tokenCheck(), validateAsync(updateTransactionSchema), updateWallet);

walletRouter.delete("/wallet", tokenCheck(), deleteWallet);

export default walletRouter;