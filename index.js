const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.GalleryAdmin}:${process.env.GAllerySecret}@cluster0.jlpngjm.mongodb.net/?retryWrites=true&w=majority`;

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
    const galleryCollection = client
      .db("photopicAdmin")
      .collection("galleryImages");

    // Upload Single Image
    app.post("/new_image", async (req, res) => {
      try {
        const body = req.body;
        const query = await galleryCollection.insertOne(body);
        res.send(query);
      } catch (error) {
        console.log(error);
      }
    });

    // Get all images from database
    app.get("/all_images", async (req, res) => {
      try {
        const images = await galleryCollection.find().toArray();
        res.send(images);
      } catch (error) {
        console.log(error);
      }
    });


    // checked key point updated
    app.patch("/update_single_image/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const body = req.body;
        console.log(body);
        const options = { upsert: true };
        const updateSingleImage = {
          $set: {
            imgURL: body?.imgURL,
            isChecked: body?.isChecked,
          },
        };
        const result = await galleryCollection.updateOne(
          query,
          updateSingleImage,
          options
        );
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });


    // For Delete Images
    app.delete("/delete_gallery_images", async (req, res) => {
      try {
        const selectedImageIds = req.body;
    
        if (!selectedImageIds || !Array.isArray(selectedImageIds) || selectedImageIds.length === 0) {
          return res.status(400).json({ message: "Invalid or empty selection" });
        }

        const collection = client.db("photopicAdmin").collection("galleryImages");
    
        // Convert the array of object IDs to MongoDB ObjectID instances
        const objectIds = selectedImageIds.map((id) => new ObjectId(id));
    
        const result = await collection.deleteMany({ _id: { $in: objectIds } });
    
        if (result.deletedCount > 0) {
          res.json({
            result: result,
            message: `${result.deletedCount} Files deleted successfully.`,
          });
        } else {
          res.json({ message: "No Files deleted." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting Files." });
      }
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Gallery Running");
});
app.listen(port, () => {
  console.log("Gallery running on port:", port);
});
