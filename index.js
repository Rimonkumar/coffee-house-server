const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@rimonbd.nvxa1st.mongodb.net/?appName=RimonBD`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const isValidObjectId = (id) => ObjectId.isValid(id);

async function run() {
  try {
    await client.connect();

    const db = client.db("coffeeDB");
    const coffeeCollection = db.collection("coffee");
    const usersCollection = db.collection("users");

    app.get('/coffees', async (req, res) => {
      try {
        const result = await coffeeCollection.find().toArray();
        res.status(200).send(result);
      } catch {
        res.status(500).send({ message: "Failed to fetch coffees" });
      }
    });

    app.get('/coffees/:id', async (req, res) => {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).send({ message: "Invalid coffee ID" });
      }
      try {
        const result = await coffeeCollection.findOne({ _id: new ObjectId(id) });
        if (!result) {
          return res.status(404).send({ message: "Coffee not found" });
        }
        res.send(result);
      } catch {
        res.status(500).send({ message: "Failed to fetch coffee" });
      }
    });

    app.post('/coffees', async (req, res) => {
      try {
        const result = await coffeeCollection.insertOne(req.body);
        res.status(201).send(result);
      } catch {
        res.status(500).send({ message: "Failed to add coffee" });
      }
    });

    app.delete('/coffees/:id', async (req, res) => {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).send({ message: "Invalid coffee ID" });
      }
      try {
        const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch {
        res.status(500).send({ message: "Failed to delete coffee" });
      }
    });

    app.put('/coffees/:id', async (req, res) => {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).send({ message: "Invalid coffee ID" });
      }
      try {
        const updateDoc = {
          $set: {
            name: req.body.name,
            quantity: req.body.quantity,
            supplier: req.body.supplier,
            taste: req.body.taste,
            details: req.body.details,
            photo: req.body.photo,
            price: req.body.price,
          },
        };
        const result = await coffeeCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDoc,
          { upsert: true }
        );
        res.send(result);
      } catch {
        res.status(500).send({ message: "Failed to update coffee" });
      }
    });

    app.post('/users', async (req, res) => {
      try {
        const result = await usersCollection.insertOne(req.body);
        res.status(201).send(result);
      } catch {
        res.status(500).send({ message: "Failed to create user" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

run();

app.get('/', (req, res) => {
  res.send('Coffee server is getting hotter.');
});

app.listen(port, () => {
  console.log(`Coffee server is running on port ${port}`);
});
