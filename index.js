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

    // const taskCollection = client.db("MindJotDB").collection("tasks");
    const taskCollection = client.db("MindJotDB").collection("task");

    /////////////////////////////////////
    //           Task api              //
    /////////////////////////////////////
    app.get("/all-task/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      // const query = { email: email, status: "completed" };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    /* app.patch("/update-task/:id", async (req, res) => {
      try {
        const { updatedInfo } = req.body;
        const id = req.params.id;

        // First task: Update the task with the specified _id
        const updatedTask = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: updatedInfo.destinationStatus,
              index: updatedInfo.destinationIndex,
            },
          }
        );

        // Second task: Adjust indexes for sourceStatus and destinationStatus
        await Promise.all([
          // Update indexes for sourceStatus
          taskCollection.updateMany(
            {
              status: updatedInfo.sourceStatus,
              index: { $gt: updatedInfo.sourceIndex },
            },
            { $inc: { index: -1 } }
          ),
          // Update indexes for destinationStatus
          taskCollection.updateMany(
            {
              status: updatedInfo.destinationStatus,
              index: { $gte: updatedInfo.destinationIndex },
            },
            { $inc: { index: 1 } }
          ),
        ]);

        res.json({ message: "Task updated successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating task" });
      }
    }); */

    app.patch("/update-task/:id", async (req, res) => {
      const id = req.params.id;
      const { updatedInfo } = req.body;
      console.log(`id is: ${id} and data is: ${updatedInfo}`);
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: updatedInfo.destinationStatus,
        },
      };
      const result = await taskCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    /* app.patch("/update-sourceTask/:id", async (req, res) => {
      const { updatedInfo } = req.body;
      const query = {
        status: updatedInfo.sourceStatus,
        index: { $gt: updatedInfo.sourceIndex },
      };
      const targetedTasks = await taskCollection.find(query).toArray();
      // console.log("targetedTask:", targetedTasks);

      for (const targetedTask of targetedTasks) {
        console.log(targetedTask);
        await taskCollection.updateOne(
          { _id: targetedTask._id },
          { $set: { index: targetedTask.index - 1 } }
        );
      }
      res.send({ success: true, message: "sourceTask updated successfully" });
    });
    app.patch("/update-destinationTask/:id", async (req, res) => {
      const { updatedInfo } = req.body;
      const query = {
        status: updatedInfo.destinationStatus,
        index: { $gt: updatedInfo.destinationIndex },
      };
      const targetedTasks = await taskCollection.find(query).toArray();
      console.log("destinationTask targetedTask:", targetedTasks);

      //  for (const targetedTask of targetedTasks) {
      //   console.log(targetedTask);
      //   await taskCollection.updateOne(
      //     { _id: targetedTask._id },
      //     { $set: { index: targetedTask?.index + 1 } }
      //   );
      // }
      res.send({
        success: true,
        message: "destinationTask updated successfully",
      });
    }); */

    // app.patch("/update-sourceTask/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const { updatedInfo } = req.body;
    //   const query = {
    //     status: updatedInfo.sourceStatus,
    //     index: { $gt: updatedInfo.sourceIndex },
    //   };
    //   const targetedTasks = await taskCollection.find(query).toArray();
    //   // console.log("targetedTask:", targetedTasks);
    //   for (const targetedTask of targetedTasks) {
    //     console.log(targetedTask);
    //     await taskCollection.updateOne(
    //       { _id: targetedTask._id },
    //       { $set: { index: targetedTask.index - 1 } }
    //     );
    //   }
    // });

    /* app.patch("/update-task/:id", async (req, res) => {
      const taskId = req.params.id;
      const { updatedInfo } = req.body;
      console.log(updatedInfo);

      try {
        // First Task: Update the task with _id
        await taskCollection.updateOne(
          { _id: new ObjectId(taskId) },
          {
            $set: {
              status: updatedInfo.destinationStatus,
              index: updatedInfo.destinationIndex,
            },
          }
        );

        // Find tasks with sourceStatus and index greater than sourceIndex
        const sourceTasks = await taskCollection
          .find({
            status: updatedInfo.sourceStatus,
            index: { $gt: updatedInfo.sourceIndex },
          })
          .toArray();
        console.log("sourceTasks:", sourceTasks);

        // Update their indices to decrease by 1
        for (const sourceTask of sourceTasks) {
          // Check if the 'index' field is numeric before applying $inc
          console.log(
            'typeof sourceTask.index === "number"',
            typeof sourceTask.index === "number"
          );
          if (typeof sourceTask.index === "number") {
            await taskCollection.updateOne(
              { _id: sourceTask._id },
              { $inc: { index: -1 } }
            );
          }
        }

        // Second Task: Find tasks with destinationStatus
        const destinationTasks = await taskCollection
          .find({ status: updatedInfo.destinationStatus })
          .toArray();

        // Update their indices to increase by 1
        for (const destinationTask of destinationTasks) {
          // Check if the 'index' field is numeric before applying $inc
          if (typeof destinationTask.index === "number") {
            await taskCollection.updateOne(
              { _id: destinationTask._id },
              { $inc: { index: 1 } }
            );
          }
        }

        res.json({ success: true, message: "Tasks updated successfully" });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });
 */
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
