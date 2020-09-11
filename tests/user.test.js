const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userId = new mongoose.Types.ObjectId();
const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET);
const allowedUpdates = ["name", "email", "password", "age"];
const userOne = {
  _id: userId,
  name: "vic",
  email: "vic@example.com",
  age: 23,
  password: "htb123!",
  tokens: [{ token }],
};

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});
test("Should signup a new user", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Annn",
      email: "pdfhjdsa@gmail.com",
      password: "213s3k123",
      age: 24,
    })
    .expect(201);
});

test("should login an existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
});

test("should not login non existent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "3428hgjnkkb",
    })
    .expect(404);
});

test("should get user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${token}`)
    .send()
    .expect(200);
});

test("should not get unauthenticated user profile", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for authenticated User", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", token)
    .send()
    .expect(200);
  //console.log(user)
  const user = await User.findById(userId);
  expect(user).toBe(null);
});

test("Should NOT delete account for UNauthenticated User", async () => {
  await request(app)
    .delete("/users/me")

    .send()
    .expect(401);
});

test("should not update invalid fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", token)
    .send({ name: "Vickk", location: "Nairobi" })
    .expect(400);
});

test("should update valid user fields", async () => {
  const user=await request(app)
    .patch("/users/me")
    .set("Authorization", token)
    .send({ name: "Vict", age: 26 })
    .expect(200);
    expect(user.body.name).toBe('Vict')
});
