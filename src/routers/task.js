const express = require("express");
const authenticate = require("../middleware/auth");
const Task = require("../models/task");
const taskRouter = new express.Router();

taskRouter.post("/tasks", authenticate, async (req, res) => {
  try {
    task = { ...req.body, owner: req.user._id };
    await new Task(task).save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

taskRouter.get("/tasks", authenticate, async (req, res) => {
  try {
    match = {};
    sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split("_");
      sort[parts[0]] = parts[1] === "asc" ? 1 : -1;
    }
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    // let tasks = await Task.find({owner:req.user._id});
    const tasks = await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    if (!tasks) {
      return res.status(404).send("No tasks found");
    }
    res.send(req.user.tasks);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});
taskRouter.get("/tasks/:id", authenticate, async (req, res) => {
  try {
    const _id = req.params.id;
    let task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

taskRouter.delete("/tasks/:id", authenticate, async (req, res) => {
  try {
    let task = await Task.findByIdAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send("No Task found");
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send("");
  }
});

taskRouter.patch("/tasks/:id", authenticate, async (req, res) => {
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
      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });
      if (!task) {
        return res.status(404).send("Task does not exists");
      }
      updates.forEach((update) => {
        task[update] = req.body[update];
      });
      const savedTask = await task.save();
      if (!savedTask) {
        return res.status(500).send("Could not update");
      }

      return res.status(200).send(savedTask);
    } catch (e) {
      return res.status(500).send(e);
    }
  }
  return res.status(400).send("Invalid operation");
});
taskRouter.delete("/tasks",authenticate, async (req, res) => {
  try {
    const tasks = await Task.deleteMany({owner:req.user._id});
    res.status(200).send(tasks);
  } catch (e) {
    console.log(e);
    res.status(500).send("Unable to delete");
  }
});

module.exports = taskRouter;
