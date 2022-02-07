const express = require('express')
const app = express()
const cors=require('cors')
const ObjectId=require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
require('dotenv').config();
const fileUpload=require('express-fileupload');

const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3ngn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function run(){
    try{
        await client.connect();
        const database=client.db('postman')
        const profileCollection=database.collection('profiles')
   
    //add profile
    app.get('/profiles', async(req,res) =>{
        const cursor=profileCollection.find({});
        const profiles=await cursor.toArray();
        res.json(profiles);
    })


    //Get User
    app.get('/profiles/:id', async(req,res)=>{
    const id=req.params.id;
    const query={_id: ObjectId(id) };
    const profile=await profileCollection.findOne(query);
    console.log('load user with id: ', id);
    res.send(profile);
})


    //Update Profile
    app.put('/profiles/:id', async (req,res)=>{
        const id=req.params.id;
        const updatedUser=req.body;
        const filter={_id:ObjectId(id)};
        const options={upsert:true};
        const updateDoc={
            $set:{
                name:updatedUser.name,
                email:updatedUser.email
            }
        }
        const result=await profileCollection.updateOne(filter,updateDoc,options)
        console.log('update user', req)
        res.json(result)
    })

    //add profile
    app.post('/profiles', async(req,res) => {
    const name=req.body.name;
    const email=req.body.email;
    const pic=req.files.image;
    const picData=pic.data;
    const encodedPic= picData.toString('base64');
    const imageBuffer= Buffer.from(encodedPic, 'base64');
   const profile={
     name,
     email,
     image: imageBuffer
   }
    const result=await profileCollection.insertOne(profile); 
    res.json(result)
   })

   //Delete User
   app.delete('/profiles/:id', async(req,res)=>{
    const id=req.params.id;
    const query={_id:ObjectId(id)};
    const result=await profileCollection.deleteOne(query);
    console.log('Deleting user with id ', result);   
    res.json(result)
   })


   
    }
    finally{
          // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})