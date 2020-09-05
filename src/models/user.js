const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: {
    required: true,
    type: String,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Invalid password");
      }
    },
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  console.log("Before it was saved");
  const isModified = user.isModified("password");
  if (isModified) {
    user["password"] = await bcrypt.hash(user.password, 8);
  }
  next();
});

const user = new mongoose.model("User", userSchema);

module.exports = user;
