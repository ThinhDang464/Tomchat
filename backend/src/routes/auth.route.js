import express from "express";
import {
  signup,
  login,
  logout,
  onboard,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

//onboard method after sign up
router.post("/onboarding", protectRoute, onboard);

//check if user authenticated or not, whether have valid jwt in cookies or not
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
export default router;
