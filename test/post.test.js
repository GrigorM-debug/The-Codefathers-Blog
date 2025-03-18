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
import { createComment } from "../src/services/comment.js";

let mongodbServer;

const user1 = {
  _id: new mongoose.Types.ObjectId(),
  username: "Ivan6740",
  email: "ivan@abv.bg",
  password: "12345678",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
};

const user2 = {
  _id: new mongoose.Types.ObjectId(),
  username: "GeorgiGolem",
  email: "georgi@gmail.com",
  password: "12345678910",
  imageUrl: "https://example.com/image.jpg",
  description: "C++ developer from United States with 20 years of experience",
};

const post = {
  _id: new mongoose.Types.ObjectId(),
  title: "Test post title",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  author: user1._id,
};

const post2 = {
  _id: new mongoose.Types.ObjectId(),
  title: "Test post title2",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  author: user1._id,
};

const post3 = {
  _id: new mongoose.Types.ObjectId(),
  title: "Test post title3",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  author: user1._id,
};

const post4 = {
  _id: new mongoose.Types.ObjectId(),
  title: "Test post title4",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  author: user1._id,
};

describe("Post service unit tests", () => {
  //Start in-memory MongoDb Server and database

  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    await register(user1);
    await register(user2);
    await createPost(post, user1._id);
    await createPost(post2, user1._id);
    await createPost(post3, user1._id);
    await createPost(post4, user1._id);
  });

  //Close the connection after each test
  after(async () => {
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("createPost: Should create new posts", async () => {
    const newPostData = {
      title: "Test post title5",
      content:
        "t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
      bannerImageUrl: "https://example.com/image.jpg", // Corrected typo
    };

    const userId = user1._id;
    const postId = await createPost(newPostData, userId);

    expect(postId).not.to.be.null;

    const newPost = await Post.findById(postId);

    expect(newPost).not.to.be.null;
    expect(newPost).to.have.property("title", newPostData.title);
    expect(newPost).to.have.property("content", newPostData.content);
    expect(newPost).to.have.property(
      "bannnerImageUrl",
      newPostData.bannerImageUrl
    );
    expect(newPost.author.toString()).to.equal(userId.toString());
  });

  it("postAlreadyExistsByTitle: Should return false if post doesn't exist", async () => {
    const title = "Some Title";

    const isPostExisting = await postAlreadyExistsByTitle(title);

    expect(isPostExisting).to.false;
  });

  it("postAlreadyExistsByTitle: Should return true if post exist", async () => {
    const title = post.title;

    const isPostExisting = await postAlreadyExistsByTitle(title);

    expect(isPostExisting).to.true;
  });

  it("postExistById: Should return false if post doesn't exists", async () => {
    const postId = new mongoose.Types.ObjectId();

    const isPostExisting = await postExistById(postId);

    expect(isPostExisting).to.be.false;
  });

  it("postExistById: Should return true if post exist", async () => {
    const newPostData = {
      title: "New Test Post",
      content:
        "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      bannerImageUrl: "https://example.com/image.jpg",
    };

    const postId = await createPost(newPostData, user1._id);

    const isPostExisting = await postExistById(postId);
    expect(isPostExisting).to.be.true;
  });

  it("getAllUserPostsByUserId: Should return the last 3 posts made by this user", async () => {
    const userId = user1._id;

    const userPosts = await getAllPostsByUserId(userId);

    expect(userPosts).is.not.empty;
    expect(userPosts).to.have.lengthOf(3);
  });

  it("getAllPostsByUserIdNoLimitation: Should return all user posts", async () => {
    const userId = user1._id;

    const userPostsCount = (await Post.find({ author: userId })).length;

    const userPosts = await getAllPostsByUserIdNoLimitation(userId);

    expect(userPosts).is.not.empty;
    expect(userPosts).to.have.lengthOf(userPostsCount);
  });

  it("deletePost: Should delete the post", async () => {
    const postId = post4._id;

    await deletePost(postId);

    const post = await Post.findById(postId);

    expect(post).to.be.null;
  });

  it("updatePost: Should update the post", async () => {
    const postData = {
      title: "New Test Post",
      content:
        "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      bannerImageUrl: "https://example.com/image.jpg",
    };

    const postId = await createPost(postData, user1._id);

    const newPostData = {
      title: "New Test Post Edited",
    };

    await updatePost(postId, newPostData);
    const updatedPost = await Post.findById(postId);

    expect(updatedPost).to.have.property("title", newPostData.title);
  });

  it("isUserPostAuthor: Should return true if user is post author", async () => {
    const newPostData = {
      title: "Author Test Post",
      content:
        "CThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      bannerImageUrl: "https://example.com/image.jpg",
    };

    const postId = await createPost(newPostData, user1._id);
    const isAuthor = await isUserPostAuthor(user1._id, postId);

    expect(isAuthor).to.be.true;
  });

  it("isUserPostAuthor: Should return false if user is not post creator", async () => {
    const userId = user2._id; //This user is not the post creator
    const postId = post._id;

    const isUserPostCreator = await isUserPostAuthor(userId, postId);

    expect(isUserPostCreator).to.be.false;
  });

  it("getPostById: Should return the post by the given id", async () => {
    const newPostData = {
      title: "Author Test Post",
      content:
        "CThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      bannerImageUrl: "https://example.com/image.jpg",
    };

    const postId = await createPost(newPostData, user1._id);

    const foundedPost = await getPostById(postId);

    expect(foundedPost).to.not.be.null;
    expect(foundedPost).to.have.property("title", newPostData.title);
    expect(foundedPost).to.have.property("content", newPostData.content);
    expect(foundedPost).to.have.property(
      "bannnerImageUrl",
      newPostData.bannerImageUrl
    );
  });

  it("getAllPosts: Should return collection of all posts", async () => {
    const posts = await gellAllPosts();

    expect(posts).not.empty;
  });

  //Need to be fixed
  it("getPostByIdWithComments: Should return the post with comments", async () => {
    const newPostData = {
      _id: new mongoose.Types.ObjectId(),
      title: "Author Test Post",
      content:
        "CThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
      bannerImageUrl: "https://example.com/image.jpg",
    };

    const createdPostId = await createPost(newPostData, user1._id);

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      content:
        "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC...",
      author: user2._id,
      post: createdPostId,
    };

    // Save the comment
    await Comment.create(comment);

    // Manually update post2 to ensure it references the new comment
    await Post.findByIdAndUpdate(createdPostId, {
      $push: { comments: comment._id },
    });

    // Fetch the post with comments
    const postWithComments = await getPostByIdWithComments(createdPostId);

    // Assertions
    expect(postWithComments).to.not.be.null;
    expect(postWithComments).to.have.property("comments").that.is.an("array");
    expect(postWithComments.comments).to.not.be.empty;
    expect(postWithComments.comments[0]).to.have.property(
      "content",
      comment.content
    );
    expect(postWithComments.comments[0].author.toString()).to.equal(
      user2._id.toString()
    );
  });
});
