import User from "../src/models/User.js";
import {
  register,
  login,
  changePassword,
  userExists,
  isPasswordValid,
  newPasswordIsDifferentFromTheOldPassword,
  userExistByUsername,
  userExixtsById,
  getAllUserData,
  getUserFollowersByUserId,
  getUserFollowingsByUserId,
  checkIfUserFollowsAnotherUser,
  updateUser,
  getUserFollowingsIdsByUserId,
  followUser,
  unfollowUser
} from "../src/services/user.js";
import { assert, expect } from "chai";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";
import Follow from "../src/models/Follow.js";

let mongodbServer;

const user1 = {
  username: "Ivan6740",
  email: "ivan@abv.bg",
  password: "12345678",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
};

const user2 = {
  username: "GeorgiGolem",
  email: "georgi@gmail.com",
  password: "12345678910",
  imageUrl: "https://example.com/image.jpg",
  description: "C++ developer from United States with 20 years of experience",
};

const user3 = {
  username: "TestUser3",
  email: "user3@example.com",
  password: "password123",
  imageUrl: "https://example.com/image3.jpg",
  description: "Test user 3 description"
};

const user4 = {
  username: "TestUser4",
  email: "user4@example.com",
  password: "password123",
  imageUrl: "https://example.com/image3.jpg",
  description: "Test user 3 description"
};

let user3Id;
let user2Id;
let user1Id;
let user4Id;

describe("User service unit tests", () => {
  //Start in-memory MongoDB database
  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    await register(user1);
    await register(user2);
    await register(user3);
    await register(user4)

    await Follow.deleteMany({});

    const user1Data = await User.findOne({ username: user1.username });
    const user3Data = await User.findOne({ username: user3.username });
    const user2Data = await User.findOne({ username: user2.username });
    const user4Data = await User.findOne({ username: user4.username });
    user3Id = user3Data._id;
    user2Id = user2Data._id;
    user1Id = user1Data._id;
    user4Id = user4Data._id

    // Create follow relationships:
    // user2 follows user1
    // user3 follows user1
    await Follow.create({
      follower: user2Id,
      following: user1Id
    });
    
    await Follow.create({
      follower: user3Id,
      following: user1Id
    });
    
    // user1 follows user2
    await Follow.create({
      follower: user1Id,
      following: user2Id
    });
  });

  //Close the connection after each test
  after(async () => {
    await Follow.deleteMany({});
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("register: Should register new user and return token", async () => {
    const userData = {
      username: "Grigor6740",
      email: "grigor@abv.bg",
      password: "123456789",
      imageUrl: "https://example.com/image.jpg",
      description: "I am the best developer in the world",
    };

    const token = await register(userData);

    const createdUser = await User.findOne({
      email: userData.email,
      username: userData.username,
    });

    expect(token).to.be.not.null;
    expect(createdUser).to.have.property("_id");
    expect(createdUser)
      .to.have.property("username")
      .to.equal(userData.username);
    expect(createdUser).to.have.property("email").to.equal(userData.email);
    expect(createdUser)
      .to.have.property("imageUrl")
      .to.equal(userData.imageUrl);
    expect(createdUser)
      .to.have.property("description")
      .to.equal(userData.description);
  });

  it("login: Should login user and return token", async () => {
    const token = await login(user1);

    expect(token).to.be.not.null;
  });

  it("changePassword: Should change password successfully", async () => {
    const newPassword = "newpassword123";
    user1.newPassword = newPassword;
    user1.newPasswordRepeat = newPassword;

    await changePassword(user1);
    const changedPasswordUser = await User.findOne({
      username: user1.username,
    });

    const isMatch = await bcrypt.compare(
      newPassword,
      changedPasswordUser.passwordHash
    );

    expect(isMatch).to.be.true;
  });

  it("userExists: Should return true if user exists", async () => {
    const isUserExisting = await userExists({
      username: user1.username,
      email: user1.email,
    });
    expect(isUserExisting).to.be.true;
  });

  it("userExists: Should return false if user does not exists", async () => {
    const isUserExisting = await userExists({
      username: "Peter",
      email: "peter@abv.bg",
    });
    expect(isUserExisting).to.be.false;
  });

  it("newPasswordIsDifferentFromTheOldPassword: Should return true if the new password is the same as the old password", async () => {
    const userData = {
      username: user2.username,
      newPassword: user2.password,
    };

    const result = await newPasswordIsDifferentFromTheOldPassword(userData);
    expect(result).to.be.true;
  });

  it("newPasswordIsDifferentFromTheOldPassworf: Should return false if the new password is different from the old password", async () => {
    const userData = {
      username: user2.username,
      newPassword: "newSecurePassword456",
    };

    const result = await newPasswordIsDifferentFromTheOldPassword(userData);
    expect(result).to.be.false;
  });

  it("isPasswordValid: Should return true if password is valid", async () => {
    const isValid = await isPasswordValid({
      username: user2.username,
      email: user2.email,
      password: user2.password,
    });

    expect(isValid).to.be.true;
  });

  it("isPasswordValid: Should return false if password is not valid", async () => {
    const isValid = await isPasswordValid({
      username: user2.username,
      email: user2.email,
      password: "somePassword",
    });

    expect(isValid).to.be.false;
  });

  it("userExistByUsername: Should return true if user exists", async () => {
    const result = await userExistByUsername(user2.username);
    expect(result).to.be.true;
  });

  it("userExistByUsername: Should return false if user does not exist", async () => {
    const result = await userExistByUsername("nonexistentUser");
    expect(result).to.be.false;
  });

  it("userExixtsById: Should return true if user exists by ID", async () => {
    const existingUser = await User.findOne({ username: user1.username });
    
    const result = await userExixtsById(existingUser._id);
    expect(result).to.be.true;
  });

  it("userExixtsById: Should return false if user does not exist by ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const result = await userExixtsById(nonExistentId);
    expect(result).to.be.false;
  });

  it("getAllUserData: Should return user data with formatted createdAt", async () => {
    const existingUser = await User.findOne({ username: user2.username });
    
    const userData = await getAllUserData(existingUser._id);
    
    expect(userData).to.have.property('username').to.be.equal(user2.username);
    expect(userData).to.have.property('email').to.be.equal(user2.email);
    
    expect(userData).to.have.property('createdAt');
    expect(userData.createdAt).to.be.a('string');
    expect(userData.createdAt).to.not.be.an.instanceof(Date);
    
    expect(userData).to.have.property('passwordHash');
    expect(userData).to.have.property('imageUrl').to.be.equal(user2.imageUrl);
    expect(userData).to.have.property('description').to.be.equal(user2.description);
  });

  it("getUserFollowersByUserId: Should return empty array for user with no followers", async () => {
    const followers = await getUserFollowersByUserId(user3Id);
    
    expect(followers).to.be.an('array').that.is.empty;
  });
  
  it("getUserFollowersByUserId: Should retrieve all followers of a user", async () => {
    const followers = await getUserFollowersByUserId(user1Id);
    
    expect(followers).to.be.an('array').with.lengthOf(2);
    
    const followerIds = followers.map(f => f.follower._id.toString());
    
    expect(followerIds).to.include(user2Id.toString());
    expect(followerIds).to.include(user3Id.toString());
    
    followers.forEach(follow => {
      expect(follow.follower).to.have.property('username');
      expect(follow.follower).to.have.property('email');
      expect(follow.follower).to.have.property('imageUrl');
      expect(follow.follower).to.have.property('description');
    });
  });

  it("getUserFollowingsByUserId: Should return empty array for user with no followings", async () => {
    const followings = await getUserFollowingsByUserId(user4Id);

    expect(followings).to.be.an('array').that.is.empty;
  })

  it("getUserFollowingsByUserId: Should return not empty array for user with followings", async () => {
    const followings = await getUserFollowingsByUserId(user2Id);

    expect(followings).to.be.an('array').with.lengthOf(1);
    const followingIds = followings.map(f => f.following._id.toString());
    
    expect(followingIds).to.include(user1Id.toString());

    followings.forEach(follow => {
      expect(follow.following).to.have.property('username');
      expect(follow.following).to.have.property('email');
      expect(follow.following).to.have.property('imageUrl');
      expect(follow.following).to.have.property('description');
    });
  })

  it("checkIfUserFollowsAnotherUser: Should return truthy value when user follows another user", async () => {
    const result = await checkIfUserFollowsAnotherUser(user2Id, user1Id);
    
    expect(result).to.exist;
    expect(result).to.be.ok; 
  });

  it("checkIfUserFollowsAnotherUser: Should return falsy value when user does not follow another user", async () => {
    const result = await checkIfUserFollowsAnotherUser(user3Id, user2Id);
    
    expect(result).to.not.be.ok; 
  });

  it("updateUser: Should update user data successfully", async () => {
    const updatedData = {
      description: "Updated description",
      imageUrl: "https://example.com/updated-image.jpg"
    };
    
    await updateUser(user4Id, updatedData);
    
    const updatedUser = await User.findById(user4Id);
    
    expect(updatedUser).to.have.property('description').to.equal(updatedData.description);
    expect(updatedUser).to.have.property('imageUrl').to.equal(updatedData.imageUrl);
    expect(updatedUser).to.have.property('username').to.equal(user4.username);
    expect(updatedUser).to.have.property('email').to.equal(user4.email);
  });

  it("getUserFollowingsIdsByUserId: Should return array of following IDs for a user", async () => {
    const followings = await getUserFollowingsIdsByUserId(user1Id);
    
    expect(followings).to.be.an('array').with.lengthOf(1);
    
    expect(followings[0]).to.have.property('following');
    expect(followings[0].following.toString()).to.equal(user2Id.toString());
    
    expect(Object.keys(followings[0])).to.have.lengthOf(2); // _id and following
    expect(followings[0]).to.have.property('_id');
    expect(followings[0]).to.have.property('following');
    expect(followings[0]).to.not.have.property('follower');
  });

  it("followUser: Should create a new follow relationship between users", async () => {
    const initialFollow = await Follow.findOne({
      follower: user4Id,
      following: user3Id
    });
    expect(initialFollow).to.be.null;
    
    await followUser(user4Id, user3Id);
    
    const createdFollow = await Follow.findOne({
      follower: user4Id,
      following: user3Id
    });
    
    expect(createdFollow).to.exist;
    expect(createdFollow.follower.toString()).to.equal(user4Id.toString());
    expect(createdFollow.following.toString()).to.equal(user3Id.toString());
  });

  it("unfollowUser: User should successfully unfollow other user", async () => {
    const initialFollow = await Follow.findOne({
      follower: user4Id,
      following: user3Id
    });
    expect(initialFollow).to.not.be.null;

    await unfollowUser(user4Id, user3Id);

    const followExist = await Follow.findOne({
      follower: user4Id,
      following: user3Id
    });

    expect(followExist).to.not.exist;
  })
});
