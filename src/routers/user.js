const express = require("express");
const User = require("../models/user");
const userRouter = new express.Router();
const multer = require("multer");
const sharp=require('sharp')
const {sendWelcomeEmail,sendOnDeleteEmail}=require('../emails/account')
var upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Must be an image file in .JPEG, .JPG and .PNG formats"));
    }
    cb(undefined, true);
  },
});
const authenticate = require("../middleware/auth");
userRouter.post("/users", async (req, res) => {
  try {
    let user = await new User(req.body).save();
    const token = await user.generateAuthtoken();
    user.tokens = user.tokens.concat({ token });
    await user.save();
    sendWelcomeEmail(user.email,user.name)
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send();
  }
});

userRouter.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (!user) {
      return res.status(404).send("Unable to find User");
    }
    const token = await user.generateAuthtoken();
    user.tokens = user.tokens.concat({ token });
    await user.save();
    res.status(200).send({ user, token });
  } catch (e) {
    console.log(e);
    res.status(404).send("Invalid Login");
  }
});

userRouter.get("/users/me", authenticate, async (req, res) => {
  // try {
  //   let users = await User.find({});
  //   res.status(200).send(users);
  // } catch (e) {
  //   res.status(500).send(e);
  // }
  // if(!req.user){
  //   return res.status(403).send("Please Authenticate")
  // }
  res.status(200).send(req.user);
});

userRouter.post("/users/logout", authenticate, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.status(200).send("Logout Succesfull");
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

userRouter.post("/users/logoutAll", authenticate, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.status(200).send("Logout from all Devices Succesfull");
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

userRouter.delete("/users/me", authenticate, async (req, res) => {
  try {
    // let user = await User.findByIdAndDelete(req.params.id);
    // if (!user) {
    //   return res.status(404).send("No User found");
    // }
    user = req.user;
    const deleteUser = await user.remove();
    sendOnDeleteEmail(deleteUser.email,deleteUser.name)
    return res.status(200).send(deleteUser);
  } catch (e) {
    console.log(e.message)
    res.status(500).send();
  }
});

userRouter.patch("/users/me", authenticate, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update);
    });
    if (isValidOperation) {
      const user = req.user;
      updates.forEach((update) => {
        user[update] = req.body[update];
      });
      const savedUser = await user.save();

      if (!savedUser) {
        return res.status(404).send();
      }
      return res.status(200).send(savedUser);
    }

    return res.status(400).send({ error: "Invalid Updates" });
  } catch (e) {
    console.log(e);
    res.status(400).send("Invalid operation");
  }
});

userRouter.post("/users/me/avatar",authenticate ,upload.single("avatar"), async (req,res)=> {
  const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
  req.user.avatar=buffer 
  await req.user.save();
  res.send()
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  res.send("Image upload succesfull");
},(error,req,res,next)=>{
  if(error){
    res.status(400).send(error.message)
  }
});

userRouter.delete("/users/me/avatar",authenticate, async (req,res)=>{
  req.user.avatar=undefined
  try{
  await req.user.save()
  return res.status(200).send("Avatar Deleted succesfully")
  }catch(e){
    res.status(500).send("Unable to save")
  }
  res
})

userRouter.get("/users/:id/avatar",async (req,res)=>{
  try{
    
    const user=await User.findById(req.params.id)
    if(!user||!user.avatar){
      throw new Error()
    }
    res.set('Content-Type','image/png')
    res.send(user.avatar)
  }catch(e){
    res.status(404).send("User Not Found")
  }

})

module.exports = userRouter;

// userRouter.get("/users/:id",authenticate, async (req, res) => {
//   try {
//     user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send("No such user in the db");
//     }
//     res.status(200).send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });
