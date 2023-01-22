import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import db from "../config/database.js";

export const signin = async (req, res) => {

    const user = req.body;
    const { authorization } = req.headers;
    const recivedToken = authorization?.replace("Bearer ", "");
    const newToken = uuidv4();

    try {
        if (recivedToken) {
            const token = await db.collection("sessions").findOne({ token: recivedToken });
            return token ?
                res.status(202).send(token.token) :
                res.sendStatus(401);
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

        const checkWallet = await db.collection("wallet").findOne({ _id: checkUser._id });
        if (!checkWallet) {
            const newUserWallet = {
                _id: checkUser._id,
                name: checkUser.name,
                wallet: []
            }
            await db.collection("wallet").insertOne(newUserWallet);
        }

        return res.status(202).send(newToken);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

export const signup = async (req, res) => {

    const user = req.body;
    const saltRounds = 10;

    try {
        const checkEmail = await db.collection("users").findOne({ email: user.email });
        if (checkEmail) return res.status(409).send("This email already have a account!");

        delete user.confirmPassword;
        bcrypt.hash(user.password, saltRounds, async function (err, hash) {
            if (err) return console.log(err);
            await db.collection("users").insertOne({
                ...user,
                password: hash
            });
        });

        return res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};