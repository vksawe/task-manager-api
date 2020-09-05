const express = require("express");
const taskRouter = new express.Router();
const Task = require("../models/task");
taskRouter.post("/tasks", async (req, res) => {
  try {
    let task = await new Task(req.body).save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

taskRouter.get("/tasks", async (req, res) => {
  try {
    let tasks = await Task.find({});
    if (!tasks) {
      return res.status(404).send("No tasks found");
    }
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});
taskRouter.get("/tasks/:id", async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

taskRouter.delete("/tasks/:id", async (req, res) => {
  try {
    let task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).send("No Task found");
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send("");
  }
});

taskRouter.patch("/tasks/:id", async (req, res) => {
  const allowedUpdates = ["description", "completed"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (isValidOperation) {
    try {
      // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      //   new: true,
      //   runValidators: true,
      // });
      const task = await Task.findById(req.params.id);
      updates.forEach((update) => {
        task[update] = req.body[update];
      });
      const savedTask=await task.save();
      if (!savedTask) {
        return res.status(404).send("No such user");
      }
      
      return res.status(200).send(savedTask);
    } catch (e) {
      return res.status(500).send(e);
    }
  }
  return res.status(400).send("Invalid operation");
});

module.exports = taskRouter;
