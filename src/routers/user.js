const express = require("express");
const User = require("../models/user");
const userRouter = new express.Router();

userRouter.post("/users", async (req, res) => {
  try {
    let user = await new User(req.body).save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

userRouter.get("/users", async (req, res) => {
  try {
    let users = await User.find({});
    res.status(200).send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

userRouter.get("/users/:id", async (req, res) => {
  try {
    user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("No such user in the db");
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

userRouter.delete("/users/:id", async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("No User found");
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send("");
  }
});

userRouter.patch("/users/:id", async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update);
    });
    if (isValidOperation) {
      const user = await User.findById(req.params.id);
      updates.forEach((update) => {
        user[update] = req.body[update];
      });
      const savedUser=await user.save();
      // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      //   runValidators: true,
      //   new: true,
      // });
      if (!savedUser) {
        return res.status(404).send();
      }
      console.log(savedUser)
      return res.status(200).send(savedUser);
    }

    throw new Error("Invalid Operation");
  } catch (e) {
    console.log(e);
    res.status(400).send("Invalid operation");
  }
});

module.exports = userRouter;
