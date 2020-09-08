const express = require("express");
const User = require("../models/user");
const userRouter = new express.Router();
const authenticate = require("../middleware/auth");
userRouter.post("/users", async (req, res) => {
  try {
    let user = await new User(req.body).save();
    const token = await user.generateAuthtoken();
    user.tokens = user.tokens.concat({ token });
    await user.save();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
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
    user=req.user;
    const deleteUser = await user.remove();
    res.status(200).send(deleteUser);
  } catch (e) {
    res.status(500).send("");
  }
});

userRouter.patch("/users/me", authenticate, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => {return allowedUpdates.includes(update);});
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

    return res.status(400).send({error:'Invalid Updates'})
  } catch (e) {
    console.log(e);
    res.status(400).send("Invalid operation");
  }
});

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
