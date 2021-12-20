const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 5000;
// onlineVegetableDB
// o8uAGENO7ei9L6zP
//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aubya.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("vegetableShop");
    const productCollection = database.collection("FreshProduct");
    const orderCollection = database.collection("allOrders");
    const usersCollection = database.collection('users')
    const reviewCollection = database.collection('reviews');

    //add Product to Db
    app.post("/addproduct", async (req, res) => {
      const name = req.body.name;
      const category = req.body.category;
      const price = req.body.price;

      const pic = req.files.image;
      const picdata = pic.data;
      const encodedpic = picdata.toString("base64");
      const imageBuffer = Buffer.from(encodedpic, "base64");
      const data = {
        name,
        price,
        category,
        image: imageBuffer,
      };
      const result = await productCollection.insertOne(data);
      //   console.log(result);
      res.send(result);
    });

    //get all product from db
    app.get("/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send(result);
    });
    // search product
    app.get("/products/search", async (req, res) => {
      const query = req.query.val;
      // console.log(query);
      const result = await productCollection.find({}).toArray();
      const SearchVal = result.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      // console.log(SearchVal)
      res.send(SearchVal);
    });
    //get vegetable
    app.get("/product/vegetable", async (req, res) => {
      console.log("hii");
      const result = await productCollection.find({}).toArray();
      const cursor = result.filter((product) =>
        product.category.toLowerCase().includes("vegetable".toLocaleLowerCase())
      );
      res.send(cursor);
    });

    //get fruit
    app.get("/product/fruit", async (req, res) => {
      console.log("changes")
      const result = await productCollection.find({}).toArray();
      const cursor = result.filter((product) =>
        product.category.toLowerCase().includes("fruit".toLocaleLowerCase())
      );
      res.send(cursor);
    });

    //get single product from db
    app.get("/products/:id", async (req, res) => {
      console.log("hitting");
      const id = req.params.id;
      // console.log(typeof id)
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // add all orders to dB
    app.post("/addOrder", async (req, res) => {
      const body = req.body;
      const result = await orderCollection.insertOne(body);
      res.send(result);
    });

    //get my order
    app.get("/product/myOrder", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const filter = {email:email}
      const result = await orderCollection.find(filter).toArray();
      // console.log(result)
      res.send(result);
    });

    // cancel order from user
    app.delete('/products/cancel/:id',async(req,res)=>{
      const id = req.params.id
      const filter = {_id:ObjectId(id)}
      const result = await orderCollection.deleteOne(filter)
      console.log(result)
      res.send(result)
    })
    // delete product for manage produc
    app.delete('/products/managedelete/:id',async(req,res)=>{
      const id = req.params.id 
      const filter = {_id:ObjectId(id)}
      const result = await productCollection.deleteOne(filter)
      res.send(result)
    })

  //manageAll orders
  app.get('/manageallOrder',async(req,res)=>{
    const result = await orderCollection.find({}).toArray()
    res.send(result)
  })

  // update the status
  app.put('/status/update/:id',async(req,res)=>{
    const status = req.body.status
    const id = req.params.id 
    const filter = {_id:ObjectId(id)}
    const updateDoc = { $set: { status: status } };
    const result = await orderCollection.updateOne(filter,updateDoc)
    res.send(result)
  })

  // amangealloreder cancel an order
  app.delete('/manageallorder/cancel/:id',async(req,res)=>{
    const id = req.params.id 
    const filter = {_id:ObjectId(id)}
    const result = await orderCollection.deleteOne(filter)
    res.send(result)
  })
//

    // save  user to database
    app.post('/users',async(req,res)=>{
      const body = req.body
      const result = await usersCollection.insertOne(body)
      // console.log(result)
      res.send(result)
    })
    //save to user in db from google signin
    app.put('/users',async(req,res)=>{
      const user = req.body
      const email = req.body.email
      const filter = {email:email}
      const options = {upsert:true}
      const data = {$set:user}
     const result = await usersCollection.updateOne(filter, data, options);
    //  console.log(result)
     res.send(result)
    })

    //make admin 
    app.put('/users/makeadmin',async(req,res)=>{
      const email = req.body.email
      const filter = {email:email}
      const updateDoc = {$set:{role:'admin'}}
      const result = await usersCollection.updateOne(filter,updateDoc)
      res.json(result)
    })

    //Check admin or not
    app.get('/users/admin/:email',async(req,res)=>{
      const email = req.params.email
      console.log('admin hitting')
      const filter = {email}
      const result = await usersCollection.findOne(filter)
      console.log(result)
      let isAdmin = false
      if(result?.role==='admin'){
        isAdmin=true
      }
      res.send({admin:isAdmin})
    })

    //review from dashboard
    app.post('/review',async(req,res)=>{
      const body = req.body
      const result = await reviewCollection.insertOne(body)
      console.log(result)
      res.send(result)
    })

    //get all review
    app.get('/getreview',async(req,res)=>{
      console.log('reviewsa')
      const result = await reviewCollection.find({}).toArray()
      res.send(result)
    })
    //
  } finally {
    //    await client.close()
  }
}
run().catch(console.dir);

//connection testing
app.get("/", (req, res) => {
  res.send("hello from vegetable server");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
