import express from "express";
import dotenv from "dotenv";

//----------------------------------EXPRESS + ENV-----------------
const app = express();
dotenv.config();
const PORT = process.env.PORT;

//-------------------------------------API ROUTE-----------------
app.get("/api/auth/signup", (req, res) => {
  res.send("SignUp");
});

app.get("/api/auth/login", (req, res) => {
  res.send("Login");
});

app.get("/api/auth/logout", (req, res) => {
  res.send("Logout");
});

app.listen(PORT, () => {
  console.log(`Server Runnin port ${PORT}`);
});
