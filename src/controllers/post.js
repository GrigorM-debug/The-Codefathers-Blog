import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";
import { postValidator } from "../express-validator/post.js";
import { validationResult } from "express-validator";
import {
  createPost,
  gellAllPosts,
  getPostByIdWithComments,
  getAllPostsByUserId,
  postExistById,
  postAlreadyExistsByTitle,
  deletePost,
  getPostById,
} from "../services/post.js";

const postRouter = Router();

postRouter.get("/posts", async (req, res) => {
  const posts = await gellAllPosts();
  res.render("post/catalog", { posts });
});

postRouter.get("/post/details/:_id", async (req, res, next) => {
  try {
    const post = await getPostByIdWithComments(req.params._id);

    if (!post) {
      return res.render("404", {
        errors: [{ msg: err.message }],
      });
    }

    const authorPosts = await getAllPostsByUserId(post.author._id);

    const isUserPostCreater = req.user && req.user._id == post.author._id;
    res.render("post/details", { post, authorPosts, isUserPostCreater });
  } catch (err) {
    next(err);
  }
});

postRouter.get("/create", isAuthenticated(), (req, res) => {
  res.render("post/create");
});

postRouter.post(
  "/create",
  isAuthenticated(),
  postValidator,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (errors.length > 0) {
      return res.render("create", {
        errors: errors.array(),
        data: req.body,
      });
    }

    try {
      const postExists = await postAlreadyExistsByTitle(req.body.title);

      if (postExists) {
        return res.render("post/create", {
          errors: [{ msg: "Post already exists" }],
          data: req.body,
        });
      }

      const postId = await createPost(req.body, req.user._id);
      res.render(`post/details/${postId}`, {
        success: true,
        msg: "Post created successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

postRouter.get(
  "/post/delete/:id",
  isAuthenticated(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const post = await getPostById(id);

      if (!post) {
        return res.render("404");
      }

      const userId = req.user._id;

      if (post.author._id != userId) {
        return res.render(`post/details/${post._id}`, {
          errors: [{ msg: "You are not the creator of the post" }],
        });
      }

      res.render("post/delete_modal", { post: post });
    } catch (err) {
      next(err);
    }
  }
);

postRouter.post(
  "/post/delete/:id",
  isAuthenticated(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const post = await getPostById(id);

      if (!post) {
        return res.render("404");
      }

      const userId = req.user._id;

      if (post.author._id != userId) {
        return res.render(`post/details/${post._id}`, {
          errors: [{ msg: "You are not the creator of the post" }],
        });
      }

      await deletePost(id);

      res.render("/post/posts", {
        success: true,
        msg: "Post deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

postRouter.get(
  "/post/delete/:id",
  isAuthenticated(),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const post = await getPostById(id);

      if (!post) {
        res.render("404");
      }

      const userId = req.user._id;

      if (post.author._id != userId) {
        return res.render(`post/details/${post._id}`, {
          errors: [{ msg: "You are not the creator of the post" }],
        });
      }

      res.render("/post/edit", { data: post });
    } catch (err) {
      next(err);
    }
  }
);

export default postRouter;
