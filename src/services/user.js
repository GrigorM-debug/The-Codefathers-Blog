import bcrypt from "bcrypt";
import User from "../models/User.js";
import Follow from "../models/Follow.js";

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

// Retrieve followers of a user
export async function getUserFollowersByUserId(userId) {
  const followers = await Follow.find({ following: userId })
    .populate("follower")
    .lean();

  return followers;
}

// Retrieve users a user is following
export async function getUserFollowingsByUserId(userId) {
  const followings = await Follow.find({ follower: userId })
    .populate("following")
    .lean();

  return followings;
}

//Check if user follows another user
export async function checkIfUserFollowsAnotherUser(userId1, userId2) {
  const isFollowing = await Follow.exists({
    follower: userId1,
    following: userId2,
  });

  return isFollowing;
}

//Current user follows another user
export async function followUser(userId1, userId2) {
  const newFollow = await Follow.create({
    follower: userId1,
    following: userId2,
  });

  await newFollow.save();
}

//Current user unfollows another user
export async function unfollowUser(userId1, userId2) {
  await Follow.deleteOne({
    follower: userId1,
    following: userId2,
  });
}

//Get user followings ids
export async function getUserFollowingsIdsByUserId(userId) {
  const followings = await Follow.find({ follower: userId })
    .select("following")
    .lean();

  return followings;
}
