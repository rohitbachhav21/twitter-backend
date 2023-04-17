const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion } = require("mongodb");
const DATABASE = process.env.DATABASE
const bodyParser = require("body-parser");
const stripe_secret = process.env.stripe_secret
const stripe = require("stripe")(
  "sk_test_51MuxqwSI1PVmUJHRcGQueZR0UMe0msLkkQvQ89Yjveg4t29KZfcEw5vev4y82tu7Gco6gR7DNpAmINrOVRyl8QnF00QjyrDKUK"
);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
////////
app.use(bodyParser.json());

const uri =
  "mongodb+srv://projectclone123:keFC410QOsFOsHYJ@cluster1.l5aeehs.mongodb.net/?retryWrites=true&w=majority";


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    //collections
    const postCollection = client.db("database").collection("posts"); //this is post collection
    const userCollection = client.db("database").collection("user"); //this is user collection

    //get
    app.get("/post", async (req, res) => {
      const post = (await postCollection.find().toArray()).reverse();
      res.send(post);
    });
    app.get("/user", async (req, res) => {
      const user = await userCollection.find().toArray();
      res.send(user);
    });

    app.get("/loggedInUser", async (req, res) => {
      const email = req.query.email;
      const user = await userCollection.find({ email: email }).toArray();
      res.send(user);
    });
    app.get("/phoneLoggedInUser", async (req, res) => {
      const phoneNumber = req.query.phoneNumber;
      const user = await userCollection
        .find({ phoneNumber: phoneNumber })
        .toArray();
      res.send(user);
    });

    app.get("/userPost", async (req, res) => {
      const email = req.query.email;
      const post = (
        await postCollection.find({ email: email }).toArray()
      ).reverse();
      res.send(post);
    });

    //////////////
    app.get("/api/getSubscriptionPlan", async (req, res) => {
      try {
        const email = req.query.email;
        const user = await getUserFromDatabase(email);

        const subscriptionPlan = user.subscriptionPlan;

        res.json({ plan: subscriptionPlan });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "Failed to fetch subscription plan data" });
      }
    });

    const getUserFromDatabase = async (email) => {
      const user = await user.findOne({ email: email });
      return user;
    };

    //post
    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.send(result);
    });
    app.post("/register", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/userUpdates/:email", async (req, res) => {
      const filter = req.params;
      const profile = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: profile };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
  } catch (error) {
    console.log("error");
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello rohit");
});

app.listen(port, () => {
  console.log(`Twitter app listening on port ${port}`);
});
