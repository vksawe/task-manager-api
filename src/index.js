require("./db/moongose");

const express = require("express");
const app = express();
const taskRouter = require("./routers/task");
const userRouter = require("./routers/user");

const port = process.env.PORT;
app.use(express.json());
app.use(taskRouter);
app.use(userRouter);


app.listen(port, () => {
  console.log("App is listening on Port " + port);
});

