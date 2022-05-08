require('dotenv').config();
const mongoose=require("mongoose");

async function connectDB(){

    try{
        await mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser:true,useUnifiedTopology:true});
          console.log("DB connected");
     }
     catch(err){
       console.log("error" ,err.message);
     }   
}
 module.exports=connectDB;