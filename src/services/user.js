import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "./jwt.js";

export async function userExists(userData) {
  const user = await User.findOne({
    username: userData.username,
    email: userData.email,
  });

  if (!user) {
    return false;
  }

  return true;
}

export async function userExistByUsername(username) {
  const user = await User.findOne({
    username: username,
  });

  if (!user) {
    return false;
  }

  return true;
}

export async function register(userData) {
  //Hash password
  const salt = await bcrypt.genSalt(10);

  //Create user
  const user = new User({
    username: userData.username,
    email: userData.email,
    passwordHash: await bcrypt.hash(userData.password, salt),
    imageUrl: userData.imageUrl,
    description: userData.description,
  });

  //Save user
  await user.save();

  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
    imageUrl: user.imageUrl,
  };

  const token = generateToken(payload);

  return token;
}

export async function isPasswordValid(userData) {
  const user = await User.findOne({
    username: userData.username,
    email: userData.email,
  });

  const isValid = await bcrypt.compare(userData.password, user.passwordHash);

  return isValid;
}

export async function login(userData) {
  const user = await User.findOne({
    username: userData.username,
    email: userData.email,
  });

  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
    imageUrl: user.imageUrl,
  };

  const token = generateToken(payload);

  return token;
}

export async function changePassword(userData) {
  const userExist = await User.findOne({ username: userData.username });

  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(userData.newPassword, salt);

  userExist.passwordHash = newPasswordHash;

  await userExist.save();
}

export async function newPasswordIsDifferentFromTheOldPassword(userData) {
  const user = await User.findOne({ username: userData.username });

  const isMatch = await bcrypt.compare(userData.newPassword, user.passwordHash);

  return isMatch;
}

export async function userExixtsById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    return false;
  }

  return true;
}

export async function getAllUserData(userId) {
  const user = await User.findById(userId).lean();

  user.createdAt = user.createdAt.toLocaleString();

  return user;
}
