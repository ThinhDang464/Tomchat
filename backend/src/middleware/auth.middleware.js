import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized-no token provided" });
    }

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized- Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password"); //userId object when creating token, remove password cause sending to request
    if (!user)
      return res.status(401).json({ message: "Unauthorized - user not Found" });

    req.user = user; //add user to the request

    next();
  } catch (error) {
    console.log("Error in protectRoute middlware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
