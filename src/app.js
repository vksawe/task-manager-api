require("./db/moongose");
const express = require("express");
const app = express();
const taskRouter = require("./routers/task");
const userRouter = require("./routers/user");
app.use(express.json());
app.use(taskRouter);
app.use(userRouter);

module.exports=app;
