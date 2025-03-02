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
  updatePost,
} from "../services/post.js";
import { likeExistsByUserIdAndPostId } from "../services/like.js";
import { csrfSync } from "csrf-sync";

const { generateToken } = csrfSync();

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    console.log(req.body._csrf);
    return req.body["_csrf"];
  }, // Used to retrieve the token submitted by the user in a form
});

const postRouter = Router();

postRouter.get("/posts", async (req, res) => {
  const successMessage = req.session.successMessage || null;
  delete req.session.successMessage;

  const posts = await gellAllPosts();
  res.render("post/catalog", { posts, success: successMessage });
});

postRouter.get("/post/details/:_id", async (req, res, next) => {
  try {
    const userId = req?.user?._id;

    const post = await getPostByIdWithComments(req.params._id);

    const successMessage = req.session.successMessage || null;
    delete req.session.successMessage;

    const errors = req.session.errors || [];
    delete req.session.errors;

    const leaveCommentFormData = req.session.leaveCommentFormData || null;
    delete req.session.leaveCommentFormData;

    const isEditingComment = req.session.isEditingComment || false;
    delete req.session.isEditingComment;

    if (!post) {
      return res.render("error_pages/404", {
        errors: [{ msg: err.message }],
      });
    }

    const authorPosts = await getAllPostsByUserId(post.author._id);

    let isUserPostCreater;
    let isUserLikedPost;
    let isUserPostCommentAuthor;

    if (userId) {
      isUserPostCreater = req.user && req.user._id == post.author._id;

      isUserLikedPost = await likeExistsByUserIdAndPostId(userId, post._id);

      isUserPostCommentAuthor = post.comments.some(
        (c) => c.author._id == userId
      );
    }

    post.comments.forEach((comment) => {
      comment.isUserPostCommentAuthor = isUserPostCommentAuthor;
    });

    res.render("post/details", {
      post,
      authorPosts,
      isUserPostCreater,
      success: successMessage,
      errors: errors,
      isUserLikedPost,
      leaveCommentFormData,
      isEditingComment,
    });
  } catch (err) {
    next(err);
  }
});

postRouter.get("/create", isAuthenticated(), (req, res) => {
  const csrfToken = generateToken(req, true);
  res.render("post/create", { csrfToken });
});

postRouter.post(
  "/create",
  isAuthenticated(),
  csrfSynchronisedProtection,
  postValidator,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("post/create", {
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

      req.session.successMessage = {
        success: true,
        msg: "Post created successfully",
      };

      res.redirect(`/post/details/${postId}`);
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
        return res.render("error_pages/404");
      }

      const userId = req.user._id;

      if (post.author._id != userId) {
        req.session.errors = [{ msg: "You are not the creator of the post" }];

        return res.redirect(`/post/details/${id}`);
      }

      const csrfToken = generateToken(req, true);

      res.render("post/delete_modal", { post: post, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

postRouter.post(
  "/post/delete/:id",
  isAuthenticated(),
  csrfSynchronisedProtection,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const post = await getPostById(id);

      if (!post) {
        return res.render("404");
      }

      const userId = req.user._id;

      if (post.author._id != userId) {
        req.session.errors = [{ msg: "You are not the creator of the post" }];

        return res.redirect(`/post/details/${id}`);
      }

      await deletePost(id);

      req.session.successMessage = {
        success: true,
        msg: "Post deleted successfully",
      };

      res.redirect("/posts");
    } catch (err) {
      next(err);
    }
  }
);

postRouter.get("/post/edit/:id", isAuthenticated(), async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await getPostById(id);

    if (!post) {
      res.render("error_pages/404");
    }

    const userId = req.user._id;

    if (post.author._id != userId) {
      req.session.errors = [{ msg: "You are not the creator of the post" }];

      return res.redirect(`/post/details/${id}`);
    }

    const csrfToken = generateToken(req, true);
    res.render("post/edit", { data: post, csrfToken });
  } catch (err) {
    next(err);
  }
});

postRouter.post(
  "/post/edit/:id",
  isAuthenticated(),
  csrfSynchronisedProtection,
  postValidator,
  async (req, res, next) => {
    const { id } = req.params;

    const post = await getPostById(id);

    if (!post) {
      return res.render("error_pages/404", {
        errors: [{ msg: "Post not found" }],
      });
    }

    const userId = req.user._id;

    if (post.author._id != userId) {
      req.session.errors = [{ msg: "You are not the creator of the post" }];

      return res.redirect(`/post/details/${id}`);
    }

    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      return res.render("post/edit", { data: post, errors: errors.array() });
    }

    try {
      await updatePost(id, req.body);

      req.session.successMessage = {
        success: true,
        msg: "Post successfully updated",
      };

      res.redirect(`/post/details/${id}`);
    } catch (err) {
      next(err);
    }
  }
);

export default postRouter;
