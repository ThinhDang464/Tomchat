import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const recommendedUser = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, //exclude currentUser friend list
        { isOnboarded: true }, //only onboarded user
      ],
    });
    res.status(200).json(recommendedUser);
  } catch (error) {
    console.log("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getMyFriends = async (req, res) => {
  try {
    //we only have friends id in req.user.friends -> need full object -> populate
    /*
     const user sample data: 
     {
        _id: ObjectId("507f1f77bcf86cd799439011"), // The user's ID
        friends: [
            {
            _id: ObjectId("507f1f77bcf86cd799439012"),
            fullName: "John Doe",
            profilePic: "https://example.com/avatar1.jpg",
            nativeLanguage: "English",
            learningLanguage: "Spanish"
            },
            {
            _id: ObjectId("507f1f77bcf86cd799439013"),
            fullName: "Jane Smith", 
            profilePic: "https://example.com/avatar2.jpg",
            nativeLanguage: "French",
            learningLanguage: "German"
            }
    ]
    }   
     */

    //only use populate for schema prop with ref
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );
    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user._id;
    //grab friend user id from dynamic url param
    const recipientId = req.params.id;

    //prevent self requet
    if (myId.toString() === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    //recipient user exist
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found" });
    }

    //if already friend
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    //if already sent request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists" });
    }

    //valid request
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.log("Error in friendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    //id of friendRequest object in database
    const requestId = req.params.id;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    //Verify current user is the recipient
    if (!friendRequest.recipient.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You cannot accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    //update userid friend list, and sender friend list
    //addtoset = add element to array if they do not already exist
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in friendaccept controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    //getting incoming request for user, populate senders to get full detail for front end display
    const incomingReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user._id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getfriendrequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOutgoingFriendReqs = async (req, res) => {
  try {
    const outGoingReqs = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );
    res.status(200).json(outGoingReqs); //get direct array sent over network not object with same name
  } catch (error) {
    console.log("Error in getOutgoing req controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
