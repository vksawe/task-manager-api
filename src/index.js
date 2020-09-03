require("./db/moongose");
const User = require("./models/user");
const Task = require("./models/task");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.post("/users", (req, res) => {
  new User(req.body)
    .save()
    .then((user) => {
      console.log(user);
      res.status(201).send(req.body);
    })
    .catch((e) => {
      res.status(400).send(e);
      console.log(e);
    });
});

app.get("/users", (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send(e);
    });
});

app.get("/users/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send(user);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
});

app.post("/tasks", (req, res) => {
  new Task(req.body)
    .save()
    .then((task) => {
      res.status(201).send(task);
    })
    .catch((e) => {
      console.log(e);
      res.status(404).send(e);
    });
});

app.get("/tasks", (req, res) => {
  Task.find({}).then((tasks) => {
    if (!tasks) {
      return res.status(404).send();
    }
    res.send(tasks);
  });
});
app.get("/tasks/:id", (req, res) => {
  Task.findById(req.params.id)
    .then((task) => {
      if (!task) {
        return res.status(404).send();
      }
      res.send(task);
    })
    .catch((e) => {
      res.status(500).send(e);
    });
});

app.listen(port, () => {
  console.log("App is listening on Port " + port);
});
