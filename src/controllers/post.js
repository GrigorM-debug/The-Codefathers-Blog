import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";
import { postValidator } from "../express-validator/post.js";
import { validationResult } from "express-validator";
import {
  createPost,
  gellAllPosts,
  getPostById,
  getAllPostsByUserId,
} from "../services/post.js";

const postRouter = Router();

postRouter.get("/posts", async (req, res) => {
  const posts = await gellAllPosts();
  res.render("post/catalog", { posts });
});

postRouter.get("/post/details/:_id", async (req, res) => {
  try {
    const post = await getPostById(req.params._id);
    const authorPosts = await getAllPostsByUserId(post.author._id);

    const isUserPostCreater = req.user && req.user._id == post.author._id;
    res.render("post/details", { post, authorPosts, isUserPostCreater });
  } catch (err) {
    res.render("404", {
      errors: [{ msg: err.message }],
    });
  }
});

postRouter.get("/create", isAuthenticated(), (req, res) => {
  res.render("post/create");
});

postRouter.post(
  "/create",
  isAuthenticated(),
  postValidator,
  async (req, res) => {
    const errors = validationResult(req);

    if (errors.length > 0) {
      return res.render("create", {
        errors: errors.array(),
        data: req.body,
      });
    }

    try {
      const postId = await createPost(req.body, req.user._id);
      res.render(`post/details/${postId}`, {
        success: true,
        msg: "Post created successfully",
      });
    } catch (err) {
      res.render("post/create", {
        errors: [{ msg: err.message }],
        data: req.body,
      });
    }
  }
);

export default postRouter;
