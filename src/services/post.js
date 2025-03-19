import Post from "../models/Post.js";
import { postValidationConstants } from "../validationConstants/post.js";

export async function createPost(postData, userId) {
  const newPost = new Post({
    title: postData.title,
    content: postData.content,
    bannnerImageUrl: postData.bannerImageUrl,
    author: userId,
    comments: [],  
    likes: []
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
  post.comments.forEach((comment) => {
    comment.createdAt = comment.createdAt.toLocaleString();
  });

  return post;
}

//Gets the last 3 posts made by the the user that id is given to the method
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

export async function getAllPostsByUserIdNoLimitation(userId) {
  const userPosts = await Post.find({ author: userId })
    .sort({ createdAt: "descending" })
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

export async function updatePost(postId, newData) {
  await Post.findByIdAndUpdate(postId, newData);
}

export async function isUserPostAuthor(userId, postId) {
  const post = await Post.findOne({ author: userId, _id: postId });

  if (!post) {
    return false;
  }

  return true;
}

export async function updateLikesCollectionInPostSchemaWhenLikingPost(
  postId,
  likeId
) {
  const post = await Post.findById(postId);

  post.likes.push(likeId);

  await post.save();
}

export async function updateLikesCollectionInPostSchemaWhenDislikingPost(
  postId,
  likeId
) {
  const post = await Post.findById(postId);

  const likeIndex = post.likes.indexOf(likeId);

  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
    await post.save();
  }
}

export async function updateCommentsCollectionInPostSchemaWhenCommentingPost(
  commentId,
  postId
) {
  const post = await Post.findById(postId);

  console.log(post);

  post.comments.push(commentId);
  await post.save();
}

export async function updateCommentsCollectionInPostSchemaWhenDeletingComment(
  commentId,
  postId
) {
  const post = await Post.findById(postId);

  const commentIndex = post.comments.indexOf(commentId);

  if (commentIndex > -1) {
    post.comments.splice(commentIndex, 1);
    await post.save();
  }
}

//Get the posts of the users that current user is following
export async function getFollowingsPosts(followingsIdArr) {
  //ThefollowingsIdArr contains _id and following. We need only following.
  const follwingsIds = followingsIdArr.map((f) => f.following);
  const followingsPosts = await Post.find({
    author: { $in: follwingsIds },
  })
    .populate("author")
    .lean();

  followingsPosts.forEach((p) => {
    p.createdAt = p.createdAt.toLocaleString();
  });

  return followingsPosts;
}
