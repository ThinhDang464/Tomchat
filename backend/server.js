import express from "express";

const app = express();

app.get("/api/auth/signup", (req, res) => {
  res.send("Hello World");
});

app.get("/api/auth/login", (req, res) => {
  res.send("Hello World");
});

app.get("/api/auth/logout", (req, res) => {
  res.send("Hello World");
});

app.listen(5001, () => {
  console.log("Server Runnin port 5001");
});
