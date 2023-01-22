import Joi from "joi";

export const signInSchema = Joi.object({
    password: Joi.string()
        .required(),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required()
});

export const signUpSchema = Joi.object({
    name: Joi.string()
        .required(),

    password: Joi.string()
        .required(),

    confirmPassword: Joi.ref('password'),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required()
});