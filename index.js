const express = require("express");

const cors = require("cors");

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@shazid.sdvbyar.mongodb.net/?retryWrites=true&w=majority&appName=Shazid`;

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

    const roomMateCollecttion = client.db("roomMateDB").collection("roommates");

    // get all data for listing page
    app.get("/roommates", async (req, res) => {
      const listings = await roomMateCollecttion.find().toArray();
      res.send(listings);
    });

    // 6 data load for home page
    app.get("/featured-roommates", async (req, res) => {
      const featured = await roomMateCollecttion
        .find({ availability: "available" })
        .limit(6)
        .toArray();
      res.send(featured);
    });

    // specific id, details page er jonno
    app.get("/roommate/:id", async (req, res) => {
      const id = req.params.id;

      const roommate = await roomMateCollecttion.findOne({
        _id: new ObjectId(id),
      });

      res.send(roommate);
    });

    // my listing page er data

    app.get("/myListing", async (req, res) => {
      const userEmail = req.query.email;

      const myPosts = await roomMateCollecttion
        .find({ email: userEmail || "" })
        .toArray();

      res.send(myPosts);
    });

    // roommate add korar jonno
    app.post("/roommate", async (req, res) => {
      const newRoommate = req.body;
      newRoommate.likes = 0;

      const result = await roomMateCollecttion.insertOne(newRoommate);
      res.send(result);
    });

    // update like id wise

    app.patch("/roommate/like/:id", async (req, res) => {
      const id = req.params.id;
      const result = await roomMateCollecttion.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likes: 1 } }
      );

      res.send(result);
    });

    // update data 

       // first get data by id 
    app.get("/update/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const listing = await roomMateCollecttion.findOne(query);
  res.send(listing);
});



    app.put("/roommate/:id",async(req,res)=>{
      const id=req.params.id;

      const filter={_id: new ObjectId(id)}
      const options={upsert : true};
      const newData=req.body
      const updatedDoc={
        $set:newData
      }

      const result =await roomMateCollecttion.updateOne(filter,updatedDoc,options)
      res.send(result)

    })


    // dashboard data 


    app.get("/dashboard-stats", async (req, res) => {
      try {
        const listings = await roomMateCollecttion.find().toArray();
    
        const totalPosts = listings.length;
        const totalLocations = new Set(listings.map(item => item.location)).size;
       
    
        const sharedCount = listings.filter(p => p.roomType === "Shared").length;
        const singleCount = listings.filter(p => p.roomType === "Single").length;
    
        const availableCount = listings.filter(p => p.availability === "available").length;
       
    
    
    
        res.send({
          totalPosts,
          totalLocations,
          sharedCount,
          singleCount,
          availableCount,
         
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        res.status(500).send({ message: "Server error" });
      }
    });
    







    // delete data
    app.delete("/roommate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await roomMateCollecttion.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("Shazid server is running");
});

app.listen(port, () => {
  console.log(`server is running ${port}`);
});
