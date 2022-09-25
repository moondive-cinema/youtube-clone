import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: String,
    name: String,
    avatarUrl: String,
    socialLogin: { type: Boolean, default: false },
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video"}],    
});

userSchema.pre("save", async function() {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 3);
    }
});

const User = mongoose.model("User", userSchema);
export default User;