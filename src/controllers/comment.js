import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";
import { commentExist, createComment } from "../services/comment.js";
import { postExistById } from "../services/post.js";
import { commentValidation } from "../express-validator/comment.js";
import { validationResult } from "express-validator";

const commentRouter = Router();

commentRouter.post(
  "/add/comment/post/:id",
  isAuthenticated(),
  commentValidation,
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    // //1. Check if comment exists
    // const commentExists = await commentExist(userId, id);

    // if (commentExists) {
    //   return res.render("error_pages/404", {
    //     errors: [{ msg: "You already commented this post" }],
    //   });
    // }

    //2. Check if post exists
    const postExist = await postExistById(id);

    if (!postExist) {
      return res.render("error_pages/404", {
        errors: [{ msg: "Post doesn't exist" }],
      });
    }

    //2. Validate the form data
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.errors = errors.array();
      req.session.leaveCommentFormData = req.body;

      return res.redirect(`post/details/${id}`);
    }

    try {
      const commentData = {
        content: req.body.content,
        author: userId,
        post: id,
      };

      await createComment(commentData);

      req.session.successMessage = {
        success: true,
        msg: "Comment successfully added",
      };

      res.redirect(`/post/details/${id}`);
    } catch (err) {
      next(err);
    }
  }
);

export default commentRouter;
