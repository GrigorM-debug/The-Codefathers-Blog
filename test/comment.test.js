import mongoose from "mongoose";
import { register } from "../src/services/user.js";
import { expect, use } from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createPost } from "../src/services/post.js";
import {
  commentExist,
  createComment,
  isUserCommentAuthor,
  getComment,
  deleteComment,
  updateComment
} from "../src/services/comment.js";
import Comment from "../src/models/Comment.js";
import User from "../src/models/User.js";
import Post from "../src/models/Post.js";

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
let commentId;
let comment2Id;

const comment = {
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum..",
  author: user2Id,
  post: postId,
}

const comment2 = {
  content:
    "Lorem Ipsum2 is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum..",
  author: userId,
  post: postId,
}

describe("Comment Service tests", () => {
  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    await register(user);
    await register(user2)

    const createdUser = await User.findOne({username: user.username})
    const createdUser2 = await User.findOne({username: user2.username});
    userId = createdUser._id;
    user2Id = createdUser2._id;

    const postWithComments = {
      ...post,
      comments: []
    };
    
    postId = await createPost(postWithComments, userId);

    const completeComment = {
      ...comment,
      author: user2Id,
      post: postId
    };

    const completeComment2 = {
      ...comment2,
      author: userId,
      post: postId
    };

    await createComment(completeComment);
    await createComment(completeComment2)

    const createdComment = await Comment.findOne({content: comment.content});
    const createdComment2 = await Comment.findOne({content: comment2.content});
    commentId = createdComment._id;
    comment2Id = createdComment2._id;
  });

  //Close the connection after each test
  after(async () => {
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("commentExist: Should return true if the comment exists", async () => {
    const exists = await commentExist(user2Id, postId);
    expect(exists).to.be.true;
  });

  it("commentExist: Should return false if the comment does not exist", async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const fakePostId = new mongoose.Types.ObjectId();
    const exists = await commentExist(fakeUserId, fakePostId);
    expect(exists).to.be.false;
  });

  it("isUserCommentAuthor: Should return true if the user is the comment author", async () => {
    const isAuthor = await isUserCommentAuthor(user2Id, postId);
    expect(isAuthor).to.be.true;
  });

  it("isUserCommentAuthor: Should return false if the user is not the comment author", async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const isAuthor = await isUserCommentAuthor(fakeUserId, postId);
    expect(isAuthor).to.be.false;
  });

  it("getComment: Should return the correct comment object", async () => {
    const fetchedComment = await getComment(user2Id, postId);
    expect(fetchedComment).to.be.an("object");
    expect(fetchedComment._id.toString()).to.equal(commentId.toString());
    expect(fetchedComment.content).to.equal(comment.content);
  });

  it("getComment: Should return null if the comment does not exist", async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    const fakePostId = new mongoose.Types.ObjectId();
    const fetchedComment = await getComment(fakeUserId, fakePostId);
    expect(fetchedComment).to.be.null;
  });

  it("deleteComment: Should successfully delete an existing comment", async () => {
    let exists = await commentExist(user2Id, postId);
    expect(exists).to.be.true;

    await deleteComment(user2Id, postId);

    exists = await commentExist(user2Id, postId);
    expect(exists).to.be.false;
  });

  it("updateComment: Should successfully update an existing comment", async () => {
    const originalComment = await getComment(userId, postId);
    expect(originalComment).to.be.an("object");
    expect(originalComment._id.toString()).to.equal(comment2Id.toString());
    
    const updatedContent = "This is the updated comment content";
    
    await updateComment(userId, postId, updatedContent);
    
    const updatedComment = await getComment(userId, postId);
    
    expect(updatedComment).to.be.an("object");
    expect(updatedComment.content).to.equal(updatedContent);
    expect(updatedComment._id.toString()).to.equal(comment2Id.toString());
    
    expect(new Date(updatedComment.createdAt)).to.be.at.least(new Date(originalComment.createdAt));
  });

  it("createComment: Should successfully create a comment and update post's comments collection", async () => {
    const testPost = {
      title: "Test post for comment creation",
      content: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      bannerImageUrl: "https://example.com/test-banner.jpg",
      comments: [],
      author: userId,
      createdAt: new Date(),
    };

    const newPostId = await createPost(testPost, userId);
    
    const testComment = {
      content: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line in section 1.10.32",
      author: userId,
      post: newPostId
    };

    await createComment(testComment);

    const createdComment = await Comment.findOne({content: testComment.content, post: newPostId});

    expect(createdComment).to.be.an("object");
    expect(createdComment.content).to.equal(testComment.content);
    expect(createdComment.author.toString()).to.equal(userId.toString());
    expect(createdComment.post.toString()).to.equal(newPostId.toString());
    
    const updatedPost = await Post.findById(newPostId);
    expect(updatedPost.comments).to.be.an("array");
    expect(updatedPost.comments).to.have.lengthOf(1);
    expect(updatedPost.comments[0].toString()).to.equal(createdComment._id.toString());
  })
});
