import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

export async function createPost(postData, userId) {
  const postAlreadyExists = await Post.findOne({ title: postData.title });

  if (postAlreadyExists) {
    throw new Error("Post already exists");
  }

  const newPost = new Post({
    title: postData.title,
    content: postData.content,
    bannnerImageUrl: postData.bannerImageUrl,
    author: userId,
  });

  const savedPost = await newPost.save();

  return savedPost._id;
}

export async function gellAllPosts() {
  const posts = await Post.find().populate("author", "username").lean();

  posts.forEach((post) => {
    post.createdAt = post.createdAt.toLocaleString();
  });

  return posts;
}

export async function getPostById(postId) {
  const post = await Post.findById(postId)
    .populate("author")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
      },
    })
    .lean();

  console.log(post);

  if (!post) {
    throw new Error("Post does not exist");
  }

  post.createdAt = post.createdAt.toLocaleString();
  post.author.createdAt = post.author.createdAt.toLocaleString();

  return post;
}

export async function getAllPostsByUserId(userId) {
  const userPosts = await Post.find({ author: userId })
    .sort({ createdAt: "descending" })
    .lean();

  userPosts.forEach((post) => {
    post.createdAt = post.createdAt.toLocaleString();
  });

  return userPosts;
}
