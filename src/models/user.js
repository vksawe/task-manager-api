const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const userSchema = new mongoose.Schema(
  {
    avatar:{type:Buffer},
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
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
    tokens: [
      {
        token: {
          required: true,
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.virtual("tasks", {
  ref: "tasks",
  localField: "_id",
  foreignField: "owner",
});

userSchema.pre("save", async function (next) {
  const user = this;
  const isModified = user.isModified("password");
  if (isModified) {
    user["password"] = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }
  const isUser = await bcrypt.compare(password, user.password);
  if (!isUser) {
    throw new Error("Invalid Login");
  }
  return user;
};
userSchema.methods.generateAuthtoken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  return token;
};
userSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.tokens;
  delete userObject.password;
  delete userObject.avatar
  return userObject;
};


userSchema.pre("remove", async function (next) {
  const user = this;

  task = await Task.deleteMany({ owner: user._id });
  next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
