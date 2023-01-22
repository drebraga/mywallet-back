import db from "../config/database.js";

const autoSignIn = () => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;

            const recivedToken = authorization?.replace("Bearer ", "");
            
            if (recivedToken) {
                const token = await db.collection("sessions").findOne({ token: recivedToken });
                return token ?
                    res.status(202).send(token.token) :
                    res.sendStatus(401);
            }
            
            next();
        } catch (error) {
            return res.sendStatus(500);
        }
    };
};

export default autoSignIn;