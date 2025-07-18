import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

//generate stream token for stream to authenticate user
router.get("/token", protectRoute, getStreamToken);
export default router;
