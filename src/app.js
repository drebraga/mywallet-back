import express from "express";
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv"
import Joi from "joi";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

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

// ------------------------------------------------------------------- /Login and SignUp

app.post("/signin", async (req, res) => {
    // Testes de Validação

    const userSchema = Joi.object({
        password: Joi.string()
            .required(),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required()
    });

    // Recebidos

    const user = req.body;
    const { authorization } = req.headers;
    const oldToken = authorization?.replace("Bearer ", "");
    const newToken = uuidv4();

    // Validação do recebido 

    const { error } = await userSchema.validateAsync(user);
    if (error) return res.status(422).send(error.message);

    try {
        if (oldToken) {
            const token = await db.collection("sessions").findOne({ token: oldToken });
            if (token) return res.status(202).send(token.token)
            return res.sendStatus(401)
        }

        const checkUser = await db.collection("users").findOne({
            email: user.email,
        });
        if (!checkUser) return res.status(403).send("User or password incorrect");

        const checkPassword = await bcrypt.compare(user.password, checkUser.password);
        if (!checkPassword) return res.status(403).send("User or password incorrect");

        const checkSession = await db.collection("sessions").findOne({ _id: checkUser._id });
        if (checkSession) {
            await db.collection("sessions").updateOne({ _id: checkUser._id }, {
                $set: { token: newToken }
            });
        } else {
            await db.collection("sessions").insertOne({
                _id: checkUser._id,
                name: checkUser.name,
                token: newToken
            });
        }

        return res.status(202).send(newToken);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

app.post("/signup", async (req, res) => {
    // Validação do recebido

    const userSchema = Joi.object({
        name: Joi.string()
            .required(),

        password: Joi.string()
            .required(),

        confirmPassword: Joi.ref('password'),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required()
    });

    // Recebidos

    const user = req.body;

    // Validação dos Recebidos

    const { error } = await userSchema.validateAsync(user);
    if (error) return res.status(422).send(err.message);

    try {
        const checkEmail = await db.collection("users").findOne({ email: user.email });
        if (checkEmail) return res.status(400).send("This email already have a account!");

        delete user.confirmPassword;
        bcrypt.hash(user.password, saltRounds, async function (err, hash) {
            if (err) console.log(err);
            await db.collection("users").insertOne({
                ...user,
                password: hash
            });
        });

        const wallet = await db.collection("wallet").find().toArray();
        if (wallet.length === 0) await db.collection("wallet").insertOne({ name: "Wallet list" });

        return res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// ------------------------------------------------------------------- Wallet


app.get("/wallet", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const user = await db.collection("sessions").findOne({ token });
        if (!user) return res.status(404).send("User not found");

        const checkWallet = await db.collection("wallet").findOne({ _id: ObjectId(user._id) });
        if (!checkWallet) {
            const newUserWallet = {
                _id: user._id,
                name: user.name,
                wallet: []
            }
            await db.collection("wallet").insertOne(newUserWallet);
            return res.send(newUserWallet);
        }

        return res.send(checkWallet);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

app.post("/wallet", async (req, res) => {
    // -------------------------------------------------------------- Validação do recebido
    const transactionSchema = Joi.object({
        type: Joi.string()
            .valid("in", "out")
            .required(),
        value: Joi.number().precision(2).required(),
        text: Joi.string().required(),
        date: Joi.string().required()
    });

    const { authorization } = req.headers;
    if (!authorization) return res.sendStatus(401);
    const token = authorization.replace("Bearer ", "");


    const { value, error } = transactionSchema.validate({ ...req.body, date: dayjs().format("DD/MM") });
    if (error) return res.status(422).send(error.message);

    try {
        const userMatch = await db.collection("sessions").findOne({ token });
        if (!userMatch) return res.sendStatus(401);

        const userWallet = await db.collection("wallet").findOne({ _id: ObjectId(userMatch._id) });

        await db.collection("wallet").updateOne({ _id: ObjectId(userWallet._id) }, {
            $set: { wallet: [value, ...userWallet.wallet] }
        });

        res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});