import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import path from "path";
//----------------------------------EXPRESS + ENV------------------------
const app = express();
dotenv.config();
const PORT = process.env.PORT;

const __dirname = path.resolve();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, //allow front end to send cookies
  })
);
//-------------------------------------JSON+Cookie------------------------
app.use(express.json());
app.use(cookieParser()); //access cookies inside request

//-------------------------------------API ROUTE-----------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

//both serve api adn react app
if (process.env.NODE_ENV === "production") {
  //fromt current directory go 1 above to frontend and dist folder
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server Runnin port ${PORT}`);
  connectDB();
});
