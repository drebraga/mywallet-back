import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv"
import Joi from "joi";
import bcrypt from "bcrypt";
import dayjs from "dayjs";

const app = express();
const PORT = 5000;
const saltRounds = 10;

// ------------------------------------------------------------------- server config

dotenv.config();
app.use(express.json());
app.use(cors());
app.listen(PORT, () => {
    console.log(`Servidor aberto na porta ${PORT}`);
});

// ------------------------------------------------------------------- mongo config

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
try {
    await mongoClient.connect();
    db = mongoClient.db();
} catch (err) {
    console.log(err);
}

// ------------------------------------------------------------------- Login

app.get("/login", async (req, res) => {
    // -------------------------------------------------------------- Validação do recebido
    const userSchema = Joi.object({
        password: Joi.string()
            .required(),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required()
    });
    const user = req.body

    try {
        await userSchema.validateAsync(user);

        const checkUser = await db.collection("users").findOne({
            email: user.email,
        });
        if (!checkUser) return res.status(404).send("Email not found");
        const checkPassword = await bcrypt.compare(user.password, checkUser.password);
        if (!checkPassword) return res.status(401).send("Wrong password");

        return res.status(202).send(checkUser._id);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

// ------------------------------------------------------------------- Cadastro

app.post("/signup", async (req, res) => {
    // -------------------------------------------------------------- Validação do recebido
    const userSchema = Joi.object({
        name: Joi.string()
            .required(),

        password: Joi.string()
            .required(),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required()
    });

    const user = req.body;

    try {
        await userSchema.validateAsync(user);

        const checkEmail = await db.collection("users").findOne({ email: user.email });
        if (checkEmail) return res.status(400).send("This email already have a account!");

        bcrypt.hash(user.password, saltRounds, async function (err, hash) {
            if (err) console.log(err);
            await db.collection("users").insertOne({
                ...user,
                password: hash,
                wallet: []
            });
        });

        return res.sendStatus(201);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

// ------------------------------------------------------------------- Wallet

app.get("/wallet", async (req, res) => {
    const { id } = req.headers;
    if (!id) return res.status(404).send("Header is required");

    try {
        const userMatch = await db.collection("users").findOne({ _id: ObjectId(id) });
        if (!userMatch) return res.status(401).send("User not found");

        const payments = await db.collection("users").findOne({ _id: ObjectId(id) });

        res.status(200).send(payments.wallet);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});

app.post("/wallet", async (req, res) => {
    const transactionSchema = Joi.object({
        type: Joi.string()
            .valid("in", "out")
            .required(),
        value: Joi.number().precision(2).required(),
        text: Joi.string().required(),
        date: Joi.string().required()
    });

    const { id } = req.headers;
    if (!id) return res.status(404).send("Header is required");

    const { value, error } = transactionSchema.validate({ ...req.body, date: dayjs().format("DD/MM") });
    if (error) return res.status(400).send(error.message);

    try {
        const userMatch = await db.collection("users").findOne({ _id: ObjectId(id) });
        if (!userMatch) return res.status(401).send("User not found");

        await db.collection("users").updateOne({ _id: ObjectId(id) }, {
            $set: { wallet: [...userMatch.wallet, value] }
        });

        res.sendStatus(202);
    } catch (err) {
        return res.status(400).send(err.message);
    }
});