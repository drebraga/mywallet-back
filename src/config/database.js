import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const mongoClient = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
let db;

// try {
//     await mongoClient.connect();
//     db = mongoClient.db("mywallet");
// } catch (err) {
//     console.log(err);
// }


mongoClient.connect(err => {
  db = client.db("mywallet");
  if (err) {
    console.log(err);
    mongoClient.close();
  }
});

export default db;