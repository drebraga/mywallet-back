import { ObjectId } from "mongodb";
import db from "../config/database.js";
import dayjs from "dayjs";


export const getWallet = async (req, res) => {

    const _id = res.locals.id;

    try {
        const checkWallet = await db.collection("wallet").findOne({ _id: ObjectId(_id) });
        
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
                        date: dayjs().format("DD/MM"),
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
    const transactionId = req.headers._id;

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