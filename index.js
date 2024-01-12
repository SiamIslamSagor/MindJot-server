const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e9we0w0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    /////////////////////////////////////
    //           all collection        //
    /////////////////////////////////////

    const taskCollection = client.db("MindJotDB").collection("tasks");

    /////////////////////////////////////
    //           Task api              //
    /////////////////////////////////////
    app.get("/all-task/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      console.log(query);
      const result = await taskCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    app.patch("/update-task/:id", async (req, res) => {
      const id = req.params.id;
      const updateInfo = req.body;
      console.log(`id is: ${id} and data is: ${updateInfo}`);
      const query = { _id: new ObjectId(id) };
      res.send({ message: "you successfully hit update api" });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("MindJot server is running @siam");
});

app.listen(port, () => {
  console.log(`MindJot server is running now on port: ${port}`);
});
