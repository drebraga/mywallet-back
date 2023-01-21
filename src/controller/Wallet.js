import { ObjectId } from "mongodb";
import Joi from "joi";
import dayjs from "dayjs";
import db from "../config/database.js";



export const getWallet = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const user = await db.collection("sessions").findOne({ token });
        if (!user) return res.status(404).send("User not found");

        const checkWallet = await db.collection("wallet").findOne({ _id: ObjectId(user._id) });
        if (!checkWallet) return res.sendStatus(404);

        return res.send(checkWallet);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

export const postWallet = async (req, res) => {
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
};