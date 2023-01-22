const validateAsync = (schema) => {
    return async (req, res, next) => {
        try {
            const { value } = await schema
                .validateAsync(req.body, { abortEarly: false });

            res.locals.value = value;

            next();
        } catch (error) {
            const errorMessages = error.details.map(err => err.message)
            return res.status(422).send(errorMessages);
        }
    };
};

export default validateAsync;