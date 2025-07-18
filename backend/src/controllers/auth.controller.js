import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

//randomly generate avatar from api
async function generateRandomAvatar() {
  try {
    const response = await fetch("https://randomuser.me/api/");
    const data = await response.json();

    // Returns the large profile picture URL
    return data.results[0].picture.large;

    // Alternative sizes available:
    // data.results[0].picture.medium
    // data.results[0].picture.thumbnail
  } catch (error) {
    console.error("Error generating random avatar:", error);
    // Fallback to empty string if API fails
    return "";
  }
}

export async function signup(req, res) {
  const { email, password, fullName } = req.body;
  try {
    //validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Passwords must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //check user already existed
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists" });
    }

    //generate random avatar
    const randomAvatar = await generateRandomAvatar();

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    //CREATE SAME USER IN STREAM FOR STREAM OWN AUTHENTICATION
    //check stream user data for data formatting
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    //generate jwt token for according user, userid as payload -> keeptrack user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    //put token in response cookies
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //max age 7 days
      httpOnly: true, //XSS protection
      sameSite: "strict", //Prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", //only https
    });

    //send response
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid email or password" });

    //create token if credential valid
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //max age 7 days
      httpOnly: true, //XSS protection
      sameSite: "strict", //Prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", //only https
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function logout(req, res) {
  //clear cookies
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

//received req.user from protectRoute
export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;

    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //update user after onboard on database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body, //same as writing each single req.body prop
        isOnboarded: true,
      },
      { new: true } //give object after update was applied
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not Found" });

    //Updated user info in stream
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(
        `Stream User Updated after onboarding for ${updatedUser.fullName}`
      );
    } catch (error) {
      console.log(
        "Error updating Stream user during onboarding:",
        error.message
      );
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("Onboarding error: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
