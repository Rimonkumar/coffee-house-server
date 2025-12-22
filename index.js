const express = require('express')
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@rimonbd.nvxa1st.mongodb.net/?appName=RimonBD`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db("coffeeDB").collection("coffee");
        const usersCollection = client.db("coffeeDB").collection("users");

        app.get('/coffees', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

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

        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee)
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        });

        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = req.body;

            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    quentity: updatedCoffee.quentity,
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


        // user related apis 
        app.post('/users', async (req, res) => {
            try {
                const newUser = req.body;
                console.log('Registering new user:', newUser);

                // Use insertOne to save the user, NOT deleteOne
                const result = await usersCollection.insertOne(newUser);

                res.status(201).send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Internal Server Error" });
            }
        });


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Coffee server id geating hotter')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
