import mongoose from "mongoose";
import bcrypt from "bcryptjs";
//timestamps for createdAt, and updatedAt
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    nativeLanguage: { type: String, default: "" },
    learningLanguage: { type: String, default: "" },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: { type: Boolean, default: false }, //need onboard = true to access services
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], //store userid directly [id1, id2, etc]
  },

  { timestamps: true }
);

//pre hook for password hashing before saving to DB
userSchema.pre("save", async function (next) {
  //preven unecessary hashing when update other fields not passwords
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(); //continue
  } catch (error) {
    next(error);
  }
});

//custom function attached to User Schema to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(
    enteredPassword,
    this.password
  );
  return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;
