import { getWallet, postWallet } from "../controller/Wallet.js";
import express from "express";

const walletRouter = express.Router();

walletRouter.get("/wallet", getWallet);

walletRouter.post("/wallet", postWallet);

export default walletRouter;