import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
//----------------------------------EXPRESS + ENV-----------------
const app = express();
dotenv.config();
const PORT = process.env.PORT;

//-------------------------------------JSON+Cookie------------------------
app.use(express.json());
app.use(cookieParser()); //access cookies inside request

//-------------------------------------API ROUTE-----------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server Runnin port ${PORT}`);
  connectDB();
});
