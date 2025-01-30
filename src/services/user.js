import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "./jwt.js";

export async function register(userData) {
  //Check if user exists
  const userExists = await User.findOne({
    username: userData.username,
    email: userData.email,
  });

  if (userExists) {
    throw new Error("User already exists");
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);

  //Create user
  const user = new User({
    username: userData.username,
    email: userData.email,
    passwordHash: await bcrypt.hash(userData.password, salt),
    imageUrl: userData.imageUrl,
  });

  //Save user
  await user.save();

  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };

  const token = generateToken(payload);

  return token;
}

export async function login(userData) {
  const user = await User.findOne({ username: userData.username, email: userData.email })

  if (user) {
    const isMatch = await bcrypt.compare(userData.password, user.passwordHash);
      if (!isMatch) {
        throw new Error("Invalid password");
      }

      const payload = {
        _id: user._id,
        username: user.username,
        email: user.email,
      };

      const token = generateToken(payload);

      return token;
  } else {
    throw new Error("User not found");
  }
}
