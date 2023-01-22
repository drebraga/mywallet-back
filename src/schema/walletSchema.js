import Joi from "joi";

export const transactionSchema = Joi.object({
    type: Joi.string()
        .valid("in", "out")
        .required(),
    value: Joi.number().precision(2).required(),
    text: Joi.string().required()
});

export const updateTransactionSchema = Joi.object({
    _id: Joi.string().required(),
    value: Joi.number().precision(2).required(),
    text: Joi.string().required()
});