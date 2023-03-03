const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://nilesh516:nilesh516@cluster0.yzs5me6.mongodb.net/inotebook";
                  

const connectToMongo =async ()=>{
   await mongoose.connect(mongoURI, ()=>{
        console.log("connected to mongoDB")
    })
}

module.exports = connectToMongo;