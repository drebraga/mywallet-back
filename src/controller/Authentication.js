import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import db from "../config/database.js";


export const signin = async (req, res) => {
    const db = res.locals.db;
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
            if (token) return res.status(202).send(token.token);
            return res.sendStatus(401);
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
    const db = res.locals.db;
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
    const saltRounds = 10;

    // Validação dos Recebidos

    const { error } = await userSchema.validateAsync(user);
    if (error) return res.status(422).send(err.message);

    try {
        const checkEmail = await db.collection("users").findOne({ email: user.email });
        if (checkEmail) return res.status(400).send("This email already have a account!");

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