const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware (অবশ্যই রাউটগুলোর উপরে থাকতে হবে)
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://coffee-store-server-rimonkumars-projects.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@rimonbd.nvxa1st.mongodb.net/?appName=RimonBD`;

// Create MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client (Optional for Vercel/Serverless but good for local)
        // await client.connect();

        const coffeeCollection = client.db("coffeeDB").collection("coffee");
        const usersCollection = client.db("coffeeDB").collection("users");

        // --- Coffee Related APIs ---

        // Get all coffees
        app.get('/coffees', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get single coffee by ID
        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);

            if (result) {
                res.send(result);
            } else {
                res.status(404).send({ message: "Coffee not found" });
            }
        });

        // Add new coffee
        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        });

        // Delete coffee
        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        });

        // Update coffee
        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = req.body;

            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    quantity: updatedCoffee.quantity,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo,
                    price: updatedCoffee.price
                }
            };

            const result = await coffeeCollection.updateOne(filter, coffee, options);
            res.send(result);
        });

        // --- User Related APIs ---

        app.post('/users', async (req, res) => {
            try {
                const newUser = req.body;
                const result = await usersCollection.insertOne(newUser);
                res.status(201).send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });

        // Get all users from the database
        app.get('/users', async (req, res) => {
            try {
                const cursor = usersCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching users:", error);
                res.status(500).send({ message: "Could not fetch users" });
            }
        });

        // Ping MongoDB
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");

    } catch (error) {
        console.error("Connection error:", error);
    }
}

// Run the database connection
run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter!');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
module.exports = app;