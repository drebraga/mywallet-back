import db from "../config/database.js";

const tokenCheck = () => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers;
            const token = authorization?.replace("Bearer ", "");
    
            if (!token) return res.sendStatus(401);
    
            const userMatch = await db.collection("sessions").findOne({ token });
    
            if (!userMatch) return res.sendStatus(401);

            res.locals.id = userMatch._id;
    
            next();
        } catch (error) {
            return res.sendStatus(500);
        }
    };
};

export default tokenCheck;