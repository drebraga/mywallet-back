import { ObjectId } from "mongodb";
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

    const value = res.locals.value;
    const _id = res.locals.id;

    try {
        await db.collection("wallet").updateOne({ _id: ObjectId(_id) }, {
            $push: {
                wallet: {
                    $each: [{
                        type: value.type,
                        value: value.value,
                        text: value.text,
                        date: value.date,
                        _id: ObjectId()
                    }],
                    $position: 0
                }
            }
        });

        res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

export const updateWallet = async (req, res) => {

    const { _id, text, value } = res.locals.value;
    const userId = res.locals.id;

    try {
        await db.collection("wallet").updateOne({
            _id: userId,
            wallet: { $elemMatch: { _id: ObjectId(_id) } }
        }, {
            $set: {
                "wallet.$.text": text,
                "wallet.$.value": value
            }
        });

        res.sendStatus(204);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

export const deleteWallet = async (req, res) => {

    const userId = res.locals.id;
    const transactionId = req.body.id;

    try {
        await db.collection("wallet").updateOne({ _id: ObjectId(userId) }, {
            $pull: {
                wallet: { _id: ObjectId(transactionId) }
            }
        });

        res.sendStatus(204);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};