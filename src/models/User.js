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
});

userSchema.pre("save", async function() {
    this.password = await bcrypt.hash(this.password, 3);
});

const User = mongoose.model("User", userSchema);
export default User;