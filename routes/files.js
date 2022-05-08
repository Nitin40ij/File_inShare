const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const {v4 :uuid4}=require('uuid');

let storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, "uploads/"),
  filename: (req, file, callback) => {
    const uniquename = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    callback(null, uniquename);
  },
});

let upload = multer({
  storage,
  limit: { fileSize: 1000000 * 100 },
}).single("myFile");

router.post("/", (req, res) => {
  
  //store file
   upload(req, res, async (err) => {

     try{

    //validate request
    if (!req.file) {
        return res.json({ error: "All fields are required." });
    }
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    // store in database
    const file = new File({
        filename:req.file.filename,
        uuid:uuid4(),
        path:req.file.path,
        size:req.file.size
    });
    const response=await file.save();
    return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`});
}
catch(err){
    console.log('error',err.message);
}
    //http:localhost:3000/files/223232hjfdfkaskdf-d34343     {looks something like that}
   });
});

router.post('/send',async(req,res)=>{
    const {uuid,emailTo,emailFrom}=req.body;
    //validate request
    if(!uuid || !emailTo || !emailFrom){
        return res.status(422).send({error:"All fields are required"});
    }
    // get data from database
    const file=await File.findOne({uuid:uuid});
    if(file.sender){
        return res.status(422).send({error:"email already sent"});
    }
    file.sender=emailFrom;
    file.reciever=emailTo;
    const response=await file.save();

    //send email

    const sendMail=require('../services/emailService')
    sendMail({
        from:emailFrom,
        to:emailTo,
        subject:"inShare file sharing",
        text:`${emailFrom} shared a file with you`,
        html:require('../services/emailTemplate')({
            emailFrom:emailFrom,
            downloadLink:`${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size:parseInt(file.size/1000) + 'KB',
            expires:'24hrs'
        })
    });
    return res.send({success:true});

});

module.exports = router;
