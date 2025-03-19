import { expect, use } from "chai";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { register } from "../src/services/user.js";
import { likePost, likeExistsByUserIdAndPostId, dislikePost } from '../src/services/like.js'
import Like from "../src/models/LIke.js";
import User from "../src/models/User.js";
import Post from "../src/models/Post.js";
import { createPost } from "../src/services/post.js";

let mongodbServer;

const user = {
  username: "TestUser",
  email: "testuser@example.com",
  password: "password123",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
  createdAt: new Date(),
};

const user2 = {
  username: "TestUser2",
  email: "testuser2@example.com",
  password: "password123",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
  createdAt: new Date(),
};

const post = {
  title: "Test post title",
  content:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  author: user._id,
  createdAt: new Date(),
};

let user2Id;
let userId;
let postId;
let likeId;

describe("Like service tests", () => {
  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    await register(user);
    await register(user2)

    const createdUser = await User.findOne({username: user.username})
    const createdUser2 = await User.findOne({username: user2.username});
    userId = createdUser._id;
    user2Id = createdUser2._id;

    const postWithLikes = {
      ...post,
      likes: []
    }

    postId = await createPost(postWithLikes, userId)

    await likePost(user2Id, postId)

    const createdLike = await Like.findOne({author: user2Id, post: postId});

    likeId = createdLike._id
  })

  //Close the connection after each test
  after(async () => {
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("likeExistsByUserIdAndPostId: should return true when a like exists for a user and post", async () => {
    const result = await likeExistsByUserIdAndPostId(user2Id, postId);
    
    expect(result).to.be.true;
  });

  it("likeExistsByUserIdAndPostId: should return false when a like does not exist for a user and post", async () => {
    const result = await likeExistsByUserIdAndPostId(userId, postId);
    
    expect(result).to.be.false;
  });

  it("likePost: should add a like and update the post's likes collection when liking a post", async () => {
    await likePost(userId, postId);
    
    const likeExists = await likeExistsByUserIdAndPostId(userId, postId);
    expect(likeExists).to.be.true;
    
    const updatedPost = await Post.findById(postId);
    
    const like = await Like.findOne({ author: userId, post: postId });
    expect(updatedPost.likes).to.include(like._id);
    
    expect(updatedPost.likes.length).to.equal(2);
  });

  it("dislikePost: should remove a like and update the post's likes collection when disliking a post", async () => {
    const likeExistsBefore = await likeExistsByUserIdAndPostId(user2Id, postId);
    expect(likeExistsBefore).to.be.true;
    
    const postBefore = await Post.findById(postId);
    const likesCountBefore = postBefore.likes.length;
    
    const likeToRemove = await Like.findOne({ author: user2Id, post: postId });
    const likeIdToRemove = likeToRemove._id;
    
    await dislikePost(user2Id, postId);
    
    const likeExistsAfter = await likeExistsByUserIdAndPostId(user2Id, postId);
    expect(likeExistsAfter).to.be.false;
    
    const updatedPost = await Post.findById(postId);
    
    expect(updatedPost.likes).to.not.include(likeIdToRemove);
    
    expect(updatedPost.likes.length).to.equal(likesCountBefore - 1);
  });
})
