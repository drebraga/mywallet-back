import express from "express";
import cors from "cors"
import authRouter from "./routes/AuthRoutes.js";
import walletRouter from "./routes/WalletRoutes.js";


const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());
app.use([authRouter, walletRouter]);

app.listen(PORT, () => {
    console.log(`Servidor aberto na porta ${PORT}`);
});