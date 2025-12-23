const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// 🔥 MUST: Explicit CORS config
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://coffee-store-client.vercel.app" // future frontend
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  })
);

// 🔥 Handle preflight requests
app.options("*", cors());

app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@rimonbd.nvxa1st.mongodb.net/?retryWrites=true&w=majority&appName=RimonBD`;

// Mongo Client (Global for serverless)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

let coffeeCollection;
let usersCollection;

async function connectDB() {
  if (!coffeeCollection) {
    await client.connect();
    const db = client.db("coffeeDB");
    coffeeCollection = db.collection("coffee");
    usersCollection = db.collection("users");
    console.log("MongoDB connected");
  }
}
connectDB();

// -------------------- Routes --------------------

app.get("/", (req, res) => {
  res.send("Coffee server is getting hotter!");
});

// Get all coffees
app.get("/coffees", async (req, res) => {
  await connectDB();
  const result = await coffeeCollection.find().toArray();
  res.send(result);
});

// Get single coffee
app.get("/coffees/:id", async (req, res) => {
  await connectDB();
  const id = req.params.id;
  const result = await coffeeCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

// Add coffee
app.post("/coffees", async (req, res) => {
  await connectDB();
  const result = await coffeeCollection.insertOne(req.body);
  res.send(result);
});

// Delete coffee
app.delete("/coffees/:id", async (req, res) => {
  await connectDB();
  const id = req.params.id;
  const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

// Update coffee
app.put("/coffees/:id", async (req, res) => {
  await connectDB();
  const id = req.params.id;

  const updateDoc = {
    $set: req.body
  };

  const result = await coffeeCollection.updateOne(
    { _id: new ObjectId(id) },
    updateDoc,
    { upsert: true }
  );

  res.send(result);
});

// Users
app.post("/users", async (req, res) => {
  await connectDB();
  const result = await usersCollection.insertOne(req.body);
  res.send(result);
});

app.get("/users", async (req, res) => {
  await connectDB();
  const result = await usersCollection.find().toArray();
  res.send(result);
});

module.exports = app;
