import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db;

try {
    const mongoClient = new MongoClient(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1
    });

    await mongoClient.connect();
    
    db = mongoClient.db("mywallet");
} catch (err) {
    console.log(err);
}

export default db;