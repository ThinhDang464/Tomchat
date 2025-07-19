import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getOutgoingFriendReqs,
  getFriendRequests,
  acceptFriendRequest,
  sendFriendRequest,
  getMyFriends,
  getRecommendedUsers,
} from "../controllers/user.controller.js";
const router = express.Router();

//apply to every route
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

//send friend request
router.post("/friend-request/:id", sendFriendRequest);

//accept friend request
router.put("/friend-request/:id/accept", acceptFriendRequest);

//get friend request to display pending and accepted friend request
router.get("/friend-requests", getFriendRequests);

//get friend request that we have sent
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
export default router;
