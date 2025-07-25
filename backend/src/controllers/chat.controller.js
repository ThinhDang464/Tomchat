import { generateStreamToken } from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.user._id);

    //use this token to visit chat page + comm + video
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
