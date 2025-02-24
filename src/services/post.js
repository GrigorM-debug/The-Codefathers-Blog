import Post from "../models/Post.js";

export async function createPost(postData, userId) {
  const newPost = new Post({
    title: postData.title,
    content: postData.content,
    bannnerImageUrl: postData.bannerImageUrl,
    author: userId,
  });

  const savedPost = await newPost.save();

  return savedPost._id;
}

export async function postAlreadyExistsByTitle(title) {
  const post = await Post.findOne({ title: title });

  if (!post) {
    return false;
  }

  return true;
}

export async function gellAllPosts() {
  const posts = await Post.find().populate("author", "username").lean();

  posts.forEach((post) => {
    post.createdAt = post.createdAt.toLocaleString();
  });

  return posts;
}

export async function getPostByIdWithComments(postId) {
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

  post.createdAt = post.createdAt.toLocaleString();
  post.author.createdAt = post.author.createdAt.toLocaleString();

  return post;
}

export async function getAllPostsByUserId(userId) {
  const userPosts = await Post.find({ author: userId })
    .sort({ createdAt: "descending" })
    .limit(3)
    .lean();

  userPosts.forEach((post) => {
    post.createdAt = post.createdAt.toLocaleString();
  });

  return userPosts;
}

export async function postExistById(id) {
  const post = await Post.findById(id);

  if (!post) {
    return false;
  }

  return true;
}

export async function deletePost(id) {
  await Post.findByIdAndDelete(id);
}

export async function getPostById(postId) {
  const post = await Post.findById(postId).lean();

  return post;
}
