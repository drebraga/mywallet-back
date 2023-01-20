import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db;

try {
    console.log("OK");
    const mongoClient = new MongoClient(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1
    });

    await mongoClient.connect();
    console.log("OK1");
    db = mongoClient.db("mywallet");
    console.log("OK2");
} catch (err) {
    console.log(err);
}

export default db;