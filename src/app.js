import express from "express";
import cors from "cors"
import authRouter from "./routes/AuthRoutes.js";
import walletRouter from "./routes/WalletRoutes.js";
import setConectionWithMongo from "./config/database.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(setConectionWithMongo());
app.use([authRouter, walletRouter]);

app.listen(process.env.PORT, () => {
    console.log(`Servidor aberto na porta ${process.env.PORT}`);
});