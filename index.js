import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongoDB() {
  try {
    await client.connect();

    const userDB = client.db("userDB");
    const userCollection = userDB.collection("users");

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id) || id.length !== 24) {
        return res.status(400).send({
          message: "Invalid User ID",
        });
      }

      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);

      res.send(result);
    });

    console.log("MongoDB connected!");

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
      console.log(newUser);
    });

    app.patch("/user/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;

      const query = { _id: new ObjectId(id) };
     const option = {};
      const updateDoc = {
        $set: {
          name: updateUser.name,
          email: updateUser.email,
        },
      };

      const result = await userCollection.updateOne(query, updateDoc, option);

      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log("User deleted from Server", id);
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

app.get("/", (req, res) => {
  res.send("Simple CRUD Server is running");
});

connectToMongoDB();
