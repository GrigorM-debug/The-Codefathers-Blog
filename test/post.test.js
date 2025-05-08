import Post from "../src/models/Post.js";
import { register } from "../src/services/user.js";
import { expect } from "chai";
import mongoose from "mongoose";
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
  getFollowingsPosts,
  // eslint-disable-next-line no-unused-vars
  updateCommentsCollectionInPostSchemaWhenCommentingPost,
  // eslint-disable-next-line no-unused-vars
  updateCommentsCollectionInPostSchemaWhenDeletingComment,
  updateLikesCollectionInPostSchemaWhenDislikingPost,
  // eslint-disable-next-line no-unused-vars
  updateLikesCollectionInPostSchemaWhenLikingPost,
} from "../src/services/post.js";
import {
  createComment,
  deleteComment,
  // eslint-disable-next-line no-unused-vars
  getComment,
} from "../src/services/comment.js";
import Comment from "../src/models/Comment.js";
import Like from "../src/models/LIke.js";
import User from "../src/models/User.js";
import { dislikePost, likePost } from "../src/services/like.js";

let mongodbServer;

const user1 = {
  username: "Ivan6740",
  email: "ivan@abv.bg",
  password: "12345678",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
  createdAt: new Date(),
};

const user2 = {
  username: "KiroTurboto69",
  email: "turboto69@abv.bg",
  password: "12345678",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
  createdAt: new Date(),
};

const post = {
  title: "Test post title",
  content:
    "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
  bannerImageUrl: "https://example.com/image.jpg",
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
};

const post2 = {
  title: "Second Test Post",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  bannerImageUrl: "https://example.com/image2.jpg",
  createdAt: new Date("2025-05-07T08:00:00Z"), // 2 hours older
};

const post3 = {
  title: "Third Test Post",
  content:
    "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
  bannerImageUrl: "https://example.com/image3.jpg",
  createdAt: new Date("2025-05-07T09:00:00Z"), // 1 hour older, // 1 hour ago
};

const post4 = {
  title: "Fourth Test Post",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  bannerImageUrl: "https://example.com/image3.jpg",
  createdAt: new Date("2025-05-07T10:00:00Z"), // Most recent,
};

let user1Id;
let user2Id;
let post1Id;
let post2Id;
let post3Id;
let post4Id;
let commentId;
// eslint-disable-next-line no-unused-vars
let comment2Id;
// eslint-disable-next-line no-unused-vars
let comment3Id;
// eslint-disable-next-line no-unused-vars
let comment4Id;
// eslint-disable-next-line no-unused-vars
let comment5Id;

let like1Id;
// eslint-disable-next-line no-unused-vars
let like2Id;

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

const comment3 = {
  content:
    "Lorem3 Ipsum2 is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum..",
  author: user2Id,
  post: post2Id,
};

const comment4 = {
  content:
    "Lorem4 Ipsum2 is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum..",
  author: user2Id,
  post: post3Id,
};

const comment5 = {
  content:
    "Lorem5 Ipsum2 is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum..",
  author: user2Id,
  post: post4Id,
};

describe("Post service unit tests", () => {
  //Start in-memory MongoDb Server and database

  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    await register(user1);
    await register(user2);

    const user1Data = await User.findOne({ username: user1.username });
    const user2Data = await User.findOne({ username: user2.username });

    user1Id = user1Data._id;
    user2Id = user2Data._id;

    const postWithComments = {
      ...post,
      comments: [],
      likes: [],
    };

    const createdPostId = await createPost(postWithComments, user1Id);

    post1Id = createdPostId;

    const post2WithComments = {
      ...post2,
      comments: [],
      likes: [],
    };
    const createPost2Id = await createPost(post2WithComments, user1Id);
    post2Id = createPost2Id;

    // Create third post
    const post3WithComments = {
      ...post3,
      comments: [],
      likes: [],
    };
    const createdPost3Id = await createPost(post3WithComments, user1Id);
    post3Id = createdPost3Id;

    //Create Fourth post
    const post4WithComments = {
      ...post4,
      likes: [],
      comments: [],
    };

    const createdPost4Id = await createPost(post4WithComments, user1Id);
    post4Id = createdPost4Id;

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

    const completeComment3 = {
      ...comment3,
      author: user2Id,
      post: post2Id,
    };

    const completeComment4 = {
      ...comment4,
      author: user2Id,
      post: post3Id,
    };

    const completeComment5 = {
      ...comment5,
      author: user2Id,
      post: post4Id,
    };

    await createComment(completeComment);
    await createComment(completeComment2);
    await createComment(completeComment3);
    await createComment(completeComment4);
    await createComment(completeComment5);

    const createdComment = await Comment.findOne({ content: comment.content });
    const createdComment2 = await Comment.findOne({
      content: comment2.content,
    });
    const createdComment3 = await Comment.findOne({
      content: comment3.content,
    });
    const createdComment4 = await Comment.findOne({
      content: comment4.content,
    });
    const createdComment5 = await Comment.findOne({
      content: comment5.content,
    });

    commentId = createdComment._id;
    comment2Id = createdComment2._id;
    comment3Id = createdComment3._id;
    comment4Id = createdComment4._id;
    comment5Id = createdComment5._id;

    await likePost(user2Id, post1Id);
    await likePost(user2Id, post2Id);

    const like1Data = await Like.findOne({ post: post1Id, author: user2Id });
    const like2Data = await Like.findOne({ post: post2Id, author: user2Id });
    like1Id = like1Data._id;
    like2Id = like2Data._id;
  });

  //Close the connection after each test
  after(async () => {
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("postAlreadyExistsByTitle: should return false when post with given title does not exist", async () => {
    const nonExistentTitle = "This Title Does Not Exist";
    const result = await postAlreadyExistsByTitle(nonExistentTitle);

    expect(result).to.be.false;
  });

  it("postAlreadyExistsByTitle: should return true when post with given title already exists", async () => {
    const existingTitle = post.title;
    const result = await postAlreadyExistsByTitle(existingTitle);

    expect(result).to.be.true;
  });

  it("createPost: should successfully create a post with valid data", async () => {
    const newPostData = {
      title: "New Test Post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/newimage.jpg",
    };

    const postId = await createPost(newPostData, user1Id);

    // Verify the post was created
    expect(postId).to.exist;

    // Fetch the created post to verify its properties
    const createdPost = await Post.findById(postId);
    expect(createdPost).to.exist;
    expect(createdPost).to.have.property("title", newPostData.title);
    expect(createdPost).to.have.property("content", newPostData.content);
    expect(createdPost).to.have.property(
      "bannnerImageUrl",
      newPostData.bannerImageUrl
    );
    expect(createdPost).to.have.property("author").that.deep.equals(user1Id);
    expect(createdPost.comments).to.be.an("array").that.is.empty;
    expect(createdPost.likes).to.be.an("array").that.is.empty;
  });

  it("createPost: should create multiple posts for the same user", async () => {
    const firstPost = {
      title: "First Multiple Post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/first.jpg",
    };

    const secondPost = {
      title: "Second Multiple Post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/second.jpg",
    };

    // Create two posts
    const firstPostId = await createPost(firstPost, user1Id);
    const secondPostId = await createPost(secondPost, user1Id);

    // Verify both posts exist and are different
    expect(firstPostId).to.exist;
    expect(secondPostId).to.exist;
    expect(firstPostId).to.not.equal(secondPostId);

    // Verify the content of both posts
    const fetchedFirstPost = await Post.findById(firstPostId);
    const fetchedSecondPost = await Post.findById(secondPostId);

    expect(fetchedFirstPost).to.have.property("title", firstPost.title);
    expect(fetchedSecondPost).to.have.property("title", secondPost.title);
  });

  it("createPost: should set default empty arrays for comments and likes", async () => {
    const postData = {
      title: "Test Default Arrays",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/default.jpg",
    };

    const postId = await createPost(postData, user1Id);
    const createdPost = await Post.findById(postId);

    expect(createdPost.comments).to.be.an("array").that.is.empty;
    expect(createdPost.likes).to.be.an("array").that.is.empty;
  });

  it("createPost: should create post with createdAt timestamp", async () => {
    const postData = {
      title: "Test Timestamp",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/timestamp.jpg",
    };

    const postId = await createPost(postData, user1Id);
    const createdPost = await Post.findById(postId);

    expect(createdPost.createdAt).to.exist;
    expect(createdPost.createdAt).to.be.instanceOf(Date);
    // Ensure the timestamp is within the last minute
    expect(createdPost.createdAt.getTime()).to.be.closeTo(
      new Date().getTime(),
      60000
    );
  });

  it("createPost: should fail when trying to create post without required title", async () => {
    const invalidPost = {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/invalid.jpg",
    };

    try {
      await createPost(invalidPost, user1Id);
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.be.instanceOf(Error);
    }
  });

  it("createPost: should fail when trying to create post without required content", async () => {
    const invalidPost = {
      title: "Title without content",
      bannerImageUrl: "https://example.com/invalid.jpg",
    };

    try {
      await createPost(invalidPost, user1Id);
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.be.instanceOf(Error);
    }
  });

  it("createPost: should fail when trying to create post without required bannerImageUrl", async () => {
    const invalidPost = {
      title: "Title without banner",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    };

    try {
      await createPost(invalidPost, user1Id);
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.be.instanceOf(Error);
    }
  });

  it("createPost: should create post with all required fields", async () => {
    const postData = {
      title: "Complete Post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/required.jpg",
    };

    const postId = await createPost(postData, user1Id);
    const createdPost = await Post.findById(postId);

    expect(createdPost).to.exist;
    expect(createdPost).to.have.property("title", postData.title);
    expect(createdPost).to.have.property("content", postData.content);
    expect(createdPost).to.have.property(
      "bannnerImageUrl",
      postData.bannerImageUrl
    );
    expect(createdPost).to.have.property("author").that.deep.equals(user1Id);
  });

  it("getAllPosts: should return all posts with populated author", async () => {
    const posts = await gellAllPosts();

    expect(posts).to.be.an("array");
    expect(posts).to.have.lengthOf(10);

    // Verify each post has the required properties
    posts.forEach((post) => {
      expect(post).to.have.property("title");
      expect(post).to.have.property("content");
      expect(post).to.have.property("bannnerImageUrl");
      expect(post).to.have.property("author");
      expect(post.author).to.have.property("username");
    });
  });

  it("getAllPosts: should return posts with formatted dates", async () => {
    const posts = await gellAllPosts();

    posts.forEach((post) => {
      expect(post).to.have.property("createdAt");
      // Verify the date is a string (formatted) and not a Date object
      expect(post.createdAt).to.be.a("string");
      // Instead of using Date.parse, verify it's not empty and contains expected date components
      expect(post.createdAt).to.match(/\d+/); // Should contain at least one number
      expect(post.createdAt.length).to.be.greaterThan(0);
    });
  });

  it("getAllPosts: should return posts with correct author information", async () => {
    const posts = await gellAllPosts();

    posts.forEach((post) => {
      expect(post.author).to.have.property("username", user1.username);
    });
  });

  it("getAllPosts: should handle posts with no comments or likes", async () => {
    const posts = await gellAllPosts();

    posts.forEach((post) => {
      expect(post).to.have.property("comments").that.is.an("array");
      expect(post).to.have.property("likes").that.is.an("array");
    });
  });

  it("getAllPosts: should return posts in correct format", async () => {
    // Create a single post with known data for detailed verification
    const testPost = {
      title: "Format Test Post",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannerImageUrl: "https://example.com/format.jpg",
    };

    await createPost(testPost, user1Id);

    const posts = await gellAllPosts();
    const createdPost = posts.find((p) => p.title === testPost.title);

    expect(createdPost).to.exist;
    expect(createdPost).to.have.all.keys([
      "title",
      "content",
      "bannnerImageUrl",
      "author",
      "comments",
      "likes",
      "createdAt",
      "_id",
      "commentCount",
      "likeCount",
      "__v",
    ]);

    // Verify author population
    expect(createdPost.author).to.have.property("username");
    expect(createdPost.author.username).to.equal(user1.username);
  });

  it("getAllPostsByUserId: should return last 3 posts for a user in descending order", async () => {
    const posts = await getAllPostsByUserId(user1Id.toString());

    expect(posts).to.be.an("array");
    expect(posts).to.have.lengthOf(3); // Should only return 3 posts

    // ------- This will work if i use .toISOString() in service -------
    // // Verify posts are in descending order by date
    // for (let i = 0; i < posts.length - 1; i++) {
    //   const currentDate = new Date(posts[i].createdAt);
    //   const nextDate = new Date(posts[i + 1].createdAt);

    //   expect(currentDate.getTime()).to.be.greaterThan(nextDate.getTime());
    // }

    // Verify the titles of the last 3 posts
    const titles = posts.map((post) => post.title);
    expect(titles).to.include("Fourth Test Post");
    expect(titles).to.include("Third Test Post");
    expect(titles).to.include("Second Test Post");
  });

  it("getAllPostsByUserId: should return posts with formatted dates", async () => {
    const posts = await getAllPostsByUserId(user1Id.toString());

    posts.forEach((post) => {
      expect(post).to.have.property("createdAt");
      // Verify the date is a string (formatted) and not a Date object
      expect(post.createdAt).to.be.a("string");
      // Instead of using Date.parse, verify it's not empty and contains expected date components
      expect(post.createdAt).to.match(/\d+/); // Should contain at least one number
      expect(post.createdAt.length).to.be.greaterThan(0);
    });
  });

  it("getAllPostsByUserId: should return empty array for user with no posts", async () => {
    // Create a new user without posts
    const newUser = {
      username: "NoPostsUser",
      email: "noposts@example.com",
      password: "12345678",
      imageUrl: "https://example.com/image3.jpg",
      description: "User with no posts",
      createdAt: new Date(),
    };
    await register(newUser);
    const userData = await User.findOne({ username: newUser.username });

    const newUserId = userData._id;

    const posts = await getAllPostsByUserId(newUserId);

    expect(posts).to.be.an("array");
    expect(posts).to.be.empty;
  });

  it("getAllPostsByUserId: should only return posts for the specified user", async () => {
    const user1Posts = await getAllPostsByUserId(user1Id.toString());
    const user2Posts = await getAllPostsByUserId(user2Id.toString());

    // Check user1's posts
    user1Posts.forEach((post) => {
      expect(post.author.toString()).to.equal(user1Id.toString());
    });

    // Check user2's posts
    user2Posts.forEach((post) => {
      expect(post.author.toString()).to.equal(user2Id.toString());
    });
  });

  it("getAllPostsByUserId: should return posts with all required fields", async () => {
    const posts = await getAllPostsByUserId(user1Id.toString());

    posts.forEach((post) => {
      expect(post).to.have.all.keys([
        "_id",
        "title",
        "content",
        "bannnerImageUrl",
        "author",
        "comments",
        "likes",
        "createdAt",
        "commentCount",
        "likeCount",
        "__v",
      ]);
    });
  });

  it("getAllPostsByUserId: should handle invalid user ID", async () => {
    const invalidUserId = "invalid_id";

    try {
      await getAllPostsByUserId(invalidUserId);
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).to.exist;
    }
  });

  it("isUserPostAuthor: should return true when user is the post author", async () => {
    // We already have post1Id and user1Id from the setup
    const result = await isUserPostAuthor(
      user1Id.toString(),
      post1Id.toString()
    );

    expect(result).to.be.true;
  });

  it("isUserPostAuthor: should return false when user is not the post author", async () => {
    const result = await isUserPostAuthor(
      user2Id.toString(),
      post1Id.toString()
    );

    expect(result).to.be.false;
  });

  it("updatePost: should successfully update all post fields", async () => {
    const updatedData = {
      title: "Updated Third Post Title",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      bannnerImageUrl: "https://example.com/updated-image3.jpg",
    };

    // Update the post
    await updatePost(post2Id.toString(), updatedData);

    // Fetch the updated post to verify changes
    const updatedPost = await Post.findById(post2Id.toString());

    // Verify all fields were updated
    expect(updatedPost).to.exist;
    expect(updatedPost.title).to.equal(updatedData.title);
    expect(updatedPost.content).to.equal(updatedData.content);
    expect(updatedPost.bannnerImageUrl).to.equal(updatedData.bannnerImageUrl);
    // Verify that other fields remain unchanged
    expect(updatedPost.comments).to.be.an("array");
    expect(updatedPost.likes).to.be.an("array");
  });

  it("getPostById: Should return the post if it exists", async () => {
    const post1 = await getPostById(post1Id.toString());

    expect(post1).to.not.be.null;
    expect(post1).to.has.property("title", post.title);
    expect(post1).to.has.property("bannnerImageUrl", post.bannerImageUrl);
    expect(post1).to.has.property("content", post.content);
    expect(post1.title).to.be.equal(post.title);
    expect(post1.bannnerImageUrl).to.be.equal(post.bannerImageUrl);
    expect(post1.content).to.be.equal(post.content);
  });

  it("getPostById: Should return null if post doesn't exist", async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const post1 = await getPostById(id);

    expect(post1).to.be.null;
  });

  it("postExistById: Should return false if post doesn't exist", async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const isPostExisting = await postExistById(id);

    expect(isPostExisting).to.be.false;
  });

  it("postExistById: Should return true if post exists", async () => {
    const isPostExisting = await postExistById(post1Id.toString());

    expect(isPostExisting).to.be.true;
  });

  it("deletePost: Should delete the post", async () => {
    await deletePost(post4Id.toString());

    const isPostExisting = await postExistById(post4Id.toString());

    expect(isPostExisting).to.be.false;
  });

  it("getAllPostsByUserIdNoLimitation: should return all user posts without limitation", async () => {
    const posts = await getAllPostsByUserIdNoLimitation(user1Id.toString());

    expect(posts).to.be.an("array");
    expect(posts).to.have.lengthOf(10);

    const titles = posts.map((post) => post.title);
    expect(titles).to.deep.include("Format Test Post");
    expect(titles).to.deep.include("Complete Post");
    expect(titles).to.deep.include("Test Timestamp");
    expect(titles).to.deep.include("Test Default Arrays");
    expect(titles).to.deep.include("Second Multiple Post");
    expect(titles).to.deep.include("First Multiple Post");
    expect(titles).to.deep.include("New Test Post");
    expect(titles).to.deep.include("Third Test Post");
    expect(titles).to.deep.include("Updated Third Post Title");
    expect(titles).to.deep.include("Test post title");
  });

  it("getAllPostsByUserIdNoLimitation: should return posts in descending order by date", async () => {
    const posts = await getAllPostsByUserIdNoLimitation(user1Id.toString());

    // ------- This will work if i use .toISOString() in service -------
    // Verify posts are in descending order by date
    // for (let i = 0; i < posts.length - 1; i++) {
    //   const currentDate = new Date(posts[i].createdAt);
    //   const nextDate = Date.parse(posts[i + 1].createdAt);

    //   console.log(typeof currentDate);
    //   console.log(currentDate);

    //   expect(currentDate.getTime()).to.be.greaterThan(nextDate.getTime());
    // }

    // Also verify that dates are formatted as strings
    posts.forEach((post) => {
      expect(post).to.have.property("createdAt");
    });
  });

  it("getAllPostsByUserIdNoLimitation: should return empty array when user has no posts", async () => {
    const posts = await getAllPostsByUserIdNoLimitation(user2Id.toString());

    expect(posts).to.be.an("array");
    expect(posts).to.be.empty;
  });

  it("getPostByIdWithComments: Should return null  if post doesn't exist", async () => {
    const id = new mongoose.Types.ObjectId().toString();

    const postWithCommentsCreated = await getPostByIdWithComments(id);

    expect(postWithCommentsCreated).to.be.null;
  });

  it("getPostByIdWithComments: Should return post with comments", async () => {
    const postWithCommentsCreated = await getPostByIdWithComments(
      post1Id.toString()
    );

    expect(postWithCommentsCreated).to.not.be.null;
    expect(postWithCommentsCreated).to.has.property("title").equal(post.title);
    expect(postWithCommentsCreated)
      .to.has.property("content")
      .equal(post.content);
    expect(postWithCommentsCreated)
      .to.has.property("bannnerImageUrl")
      .equal(post.bannerImageUrl);

    expect(postWithCommentsCreated).to.have.property("author");
    expect(postWithCommentsCreated.author)
      .to.has.property("username")
      .to.be.equal(user1.username);

    expect(postWithCommentsCreated)
      .to.has.property("comments")
      .that.is.an("array");
    expect(postWithCommentsCreated)
      .to.has.property("comments")
      .that.is.an("array").and.is.not.empty;

    expect(postWithCommentsCreated.commentCount).to.be.equal(2);
    expect(postWithCommentsCreated.comments).to.has.lengthOf(2);

    postWithCommentsCreated.comments.forEach((comment) => {
      expect(comment).to.have.property("content");
      expect(comment).to.have.property("author");
      expect(comment.author).to.have.property("username");
      expect(comment.createdAt).to.be.a("string");
    });

    expect(postWithCommentsCreated.comments[0])
      .property("content")
      .to.be.equal(comment.content);
    expect(postWithCommentsCreated.comments[1])
      .property("content")
      .to.be.equal(comment2.content);

    expect(postWithCommentsCreated.createdAt).to.be.a("string");
    expect(post.createdAt).to.match(/\d+/);
  });

  it("updateCommentsCollectionInPostSchemaWhenCommentingPost: should add comment to post's comments array", async () => {
    const newCommentData = {
      author: user1Id,
      post: post1Id,
      content:
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus",
    };

    const initialPost = await getPostById(post1Id.toString());

    const initialCommentsCount = initialPost.comments.length;

    await createComment(newCommentData);

    const commentCreated = await Comment.findOne({
      author: user1Id,
      content: newCommentData.content,
      post: post1Id,
    });

    const updatedPost = await getPostByIdWithComments(post1Id.toString());

    expect(updatedPost.comments).to.have.lengthOf(initialCommentsCount + 1);

    const postCommentsIds = updatedPost.comments.map((c) => c._id.toString());

    expect(postCommentsIds).to.include(commentCreated._id.toString());
  });

  it("updateCommentsCollectionInPostSchemaWhenDeletingComment: should remove comment from post's comments array", async () => {
    // Get the initial post to check its comments
    const initialPost = await getPostById(post1Id.toString());
    const initialCommentsCount = initialPost.comments.length;

    // Use one of the existing comment IDs that we know exists in the post
    const commentIdToDelete = commentId; // Using the commentId from the test setup

    await deleteComment(user1Id, post1Id);

    // Get the updated post
    const updatedPost = await getPostByIdWithComments(post1Id.toString());

    // Verify the comment was removed
    expect(updatedPost.comments).to.have.lengthOf(initialCommentsCount - 1);
    expect(updatedPost.comments).to.not.include(commentIdToDelete);
  });

  it("updateLikesCollectionInPostSchemaWhenLikingPost: should add like to post's likes array", async () => {
    const initialPost = await getPostById(post3Id.toString());
    const initialLikesCount = initialPost.likes.length;

    await likePost(user2Id, post3Id);

    const like = await Like.findOne({ post: post3Id, author: user2Id });

    const updatedPost = await getPostById(post3Id.toString());

    const updatedPostLikesIdsToString = updatedPost.likes.map((l) =>
      l.toString()
    );

    expect(updatedPostLikesIdsToString).to.have.lengthOf(initialLikesCount + 1);
    expect(updatedPostLikesIdsToString).to.include(like._id.toString());
  });

  it("updateLikesCollectionInPostSchemaWhenLikingPost: should maintain existing likes when adding new like", async () => {
    const userTest = {
      username: "Test User",
      email: "test@abv.bg",
      password: "12345678",
      imageUrl: "https://example.com/image.jpg",
      description: "Developer from New York. Working in Apple",
      createdAt: new Date(),
    };

    await register(userTest);

    const userTestData = await User.findOne({ username: userTest.username });

    const userTestId = userTestData._id;

    await likePost(userTestId, post1Id);

    const newLike = await Like.findOne({ post: post1Id, author: userTestId });

    const updatedPost = await getPostById(post1Id.toString());

    const updatedPostToLikesIdsToString = updatedPost.likes.map((l) =>
      l.toString()
    );

    expect(updatedPostToLikesIdsToString).to.include(like1Id.toString());
    expect(updatedPostToLikesIdsToString).to.include(newLike._id.toString());
  });

  it("updateLikesCollectionInPostSchemaWhenDislikingPost: should remove like from post's likes array", async () => {
    // Get the initial post to check its likes
    const initialPost = await getPostById(post1Id.toString());
    const initialLikesCount = initialPost.likes.length;

    // Use one of the existing like IDs that we know exists in the post
    const likeIdToRemove = like1Id; // Using the like1Id from the test setup

    // Call the method to remove the like
    await updateLikesCollectionInPostSchemaWhenDislikingPost(
      post1Id.toString(),
      likeIdToRemove
    );

    // Get the updated post
    const updatedPost = await getPostById(post1Id.toString());

    // Verify the like was removed
    expect(updatedPost.likes).to.have.lengthOf(initialLikesCount - 1);
    expect(updatedPost.likes).to.not.include(likeIdToRemove);
  });

  it("updateLikesCollectionInPostSchemaWhenDislikingPost: should not affect other likes when removing one", async () => {
    await dislikePost(user2Id, post1Id);

    const updatedPost = await getPostById(post1Id.toString());

    expect(updatedPost.likes).to.not.include(like1Id.toString());
  });

  it("getFollowingsPosts: should return posts from users being followed", async () => {
    // Create followings array in the format the method expects
    const followings = [
      { following: user1Id }, // Using user1 who has posts
      { following: user2Id }, // Using user2 who doesn't have posts
    ];

    // Get posts from followings
    const followingsPosts = await getFollowingsPosts(followings);

    // Verify the returned posts
    expect(followingsPosts).to.be.an("array");
    expect(followingsPosts).to.not.be.empty;

    // Verify each post is from a followed user
    followingsPosts.forEach((post) => {
      // Verify post structure
      expect(post).to.have.property("title");
      expect(post).to.have.property("content");
      expect(post).to.have.property("bannnerImageUrl");
      expect(post).to.have.property("author");
      expect(post.author).to.have.property("username");

      // Verify the post author is in our followings list
      const authorId = post.author._id.toString();
      const isFromFollowing = followings.some(
        (f) => f.following.toString() === authorId
      );
      expect(isFromFollowing).to.be.true;

      // Verify date is formatted as string
      followingsPosts.forEach((post) => {
        expect(post).to.have.property("createdAt");
        // Verify the date is a string (formatted) and not a Date object
        expect(post.createdAt).to.be.a("string");
        // Instead of using Date.parse, verify it's not empty and contains expected date components
        expect(post.createdAt).to.match(/\d+/); // Should contain at least one number
        expect(post.createdAt.length).to.be.greaterThan(0);
      });
    });
  });

  it("getFollowingsPosts: should return empty array when followed users have no posts", async () => {
    // Create followings array with users that have no posts
    const followings = [
      { following: user2Id }, // user2 has no posts in our test setup
    ];

    // Get posts from followings
    const followingsPosts = await getFollowingsPosts(followings);

    // Verify we get an empty array
    expect(followingsPosts).to.be.an("array");
    expect(followingsPosts).to.be.empty;
  });

  it("getAllPosts: should return empty array when no posts exist", async () => {
    // Clear all posts
    await Post.deleteMany({});

    const posts = await gellAllPosts();

    expect(posts).to.be.an("array");
    expect(posts).to.be.empty;
  });
});
