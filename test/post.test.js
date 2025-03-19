import Post from "../src/models/Post.js";
import { register } from "../src/services/user.js";
import { expect } from "chai";
import mongoose, { Mongoose } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  createPost,
  deletePost,
  gellAllPosts,
  getAllPostsByUserId,
  getAllPostsByUserIdNoLimitation,
  getPostById,
  getPostByIdWithComments,
  isUserPostAuthor,
  postAlreadyExistsByTitle,
  postExistById,
  updatePost,
} from "../src/services/post.js";
import Comment from "../src/models/Comment.js";

let mongodbServer;

const user1 = {
  username: "Ivan6740",
  email: "ivan@abv.bg",
  password: "12345678",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
  createdAt: new Date(),
};

const post = {
  title: "Test post title",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  createdAt: new Date(),
};

let user1Id;
let post1Id;
let commentId;
let comment2Id;

const comment = {
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum..",
  author: user1Id,
  post: post1Id,
};

const comment2 = {
  content:
    "Lorem Ipsum2 is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum..",
  author: user1Id,
  post: post1Id,
};

describe("Post service unit tests", () => {
  //Start in-memory MongoDb Server and database

  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    const token1 = await register(user1);
    user1Id = token1._id;

    const postWithComments = {
      ...post,
      comments: [],
      likes: [],
    };

    const createdPostId = await createPost(postWithComments, token1._id);

    post1Id = createdPostId;

    const completeComment = {
      ...comment,
      author: user1Id,
      post: post1Id,
    };

    const completeComment2 = {
      ...comment2,
      author: user1Id,
      post: post1Id,
    };

    await createComment(completeComment);
    await createComment(completeComment2);

    const createdComment = await Comment.findOne({ content: comment.content });
    const createdComment2 = await Comment.findOne({
      content: comment2.content,
    });
    commentId = createdComment._id;
    comment2Id = createdComment2._id;
  });

  //Close the connection after each test
  after(async () => {
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("should return false when post with given title does not exist", async () => {
    const nonExistentTitle = "This Title Does Not Exist";
    const result = await postAlreadyExistsByTitle(nonExistentTitle);

    expect(result).to.be.false;
  });

  it("should return true when post with given title already exists", async () => {
    const existingTitle = post.title;
    const result = await postAlreadyExistsByTitle(existingTitle);

    expect(result).to.be.true;
  });
});
