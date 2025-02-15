import User from "../src/models/User.js";
import { register, login, changePassword } from "../src/services/user.js";
import { assert, expect } from "chai";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcrypt";

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

describe("User service unit tests", () => {
  //Start in-memory MongoDB database
  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    await register(user1);
    await register(user2);
  });

  //Close the connection after each test
  after(async () => {
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("Register: Should regitered new user and return token", async () => {
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
    expect(createdUser).to.has.property("_id");
    expect(createdUser)
      .to.has.property("username")
      .to.be.equal(userData.username);
    expect(createdUser).to.has.property("email").to.be.equal(userData.email);
    expect(createdUser)
      .to.has.property("imageUrl")
      .to.be.equal(userData.imageUrl);
    expect(createdUser)
      .to.has.property("description")
      .to.be.equal(userData.description);
  });

  it("Register: Should throw exception if user already exists", async () => {
    try {
      const token = await register(user1);
    } catch (error) {
      expect(error.message).to.be.equal("User already exists");
    }
  });

  it("Login: Should login user and return token", async () => {
    const token = await login(user1);

    expect(token).to.be.not.null;
  });

  it("Login: Should throw exception if user does not exist", async () => {
    const userData = {
      username: "PeterDebeliq",
      email: "debeliq@abv.bg",
      password: "123456789",
      imageUrl: "https://example.com/image.jpg",
      description: "I am the best developer in the world",
    };

    try {
      const token = await login(userData);
    } catch (error) {
      expect(error.message).to.be.equal("User not found");
    }
  });

  it("Login: Should throw exception if password is incorrect", async () => {
    const user2WithWrongPassword = {
      username: "GeorgiGolem",
      email: "georgi@gmail.com",
      password: "123213123123",
      imageUrl: "https://example.com/image.jpg",
      description: "I am the best developer in the world",
    };

    try {
      const token = await login(user2WithWrongPassword);
    } catch (error) {
      expect(error.message).to.be.equal("Invalid password");
    }
  });

  it("Change password: Should throw exception if user does not exist", async () => {
    const notExistingUser = {
      username: "NotExistingUser",
      email: "anonymous@gmail.com",
      newPassword: "123456789",
      imageUrl: "https://example.com/image.jpg",
      description: "I am the best developer in the world",
    };

    try {
      await changePassword(notExistingUser);
    } catch (error) {
      expect(error.message).to.be.equal("User not found");
    }
  });

  it("Change password: Should throw excepyion if newPassword and repeatNewPassword are not equal", async () => {
    user1.newPassword = "bigasspassword";
    user1.newPasswordRepeat = "bigasspassword123";

    try {
      await changePassword(user1);
    } catch (error) {
      expect(error.message).to.be.equal("Passwords do not match");
    }
  });

  it("Chage password: Sould throw exception if newPassword is equal to old password", async () => {
    user1.newPassword = "12345678";
    user1.newPasswordRepeat = "12345678";

    try {
      await changePassword(user1);
    } catch (error) {
      expect(error.message).to.be.equal(
        "New password must be different from the old one"
      );
    }
  });

  it("Change password: Should change password successfully", async () => {
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
});
