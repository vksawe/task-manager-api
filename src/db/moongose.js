const mongoose = require("mongoose");
const connectionURL = "mongodb://127.0.0.1:27017/task-manager-api";
mongoose.connect(connectionURL, {
  useNewUrlParser: true,
  useCreateIndex: true,
});



// const newUser = new user({
//   name: "   vic",
//   age: 28,
//   email: "vskiprotich@gmail.com",
//   password: " dsggfdsfsdf453rd",
// });
// newUser
//   .save()
//   .then(() => {
//     console.log("User saved");
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// task1 = new task({
//   description: "Deploy to Github",
// });

// task1
//   .save()
//   .then(() => {
//     console.log("User saved", task1);
//   })
//   .catch((e) => {
//     console.log(e);
//   });
