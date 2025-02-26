import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";
import { isUserPostAuthor, postExistById } from "../services/post.js";
import { likeExistsByUserIdAndPostId, likePost } from "../services/like.js";

const likeRouter = Router();

likeRouter.post("/like/post/:id", isAuthenticated(), async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  //1. Check if post exist
  const isPostExisting = await postExistById(id);

  if (!isPostExisting) {
    return res.render("error_pages/404", {
      errors: [{ msg: "Post doesn't exist" }],
    });
  }

  //2. Check if the post is already liked
  const isPostAlreadyLiked = await likeExistsByUserIdAndPostId(userId, id);

  if (isPostAlreadyLiked) {
    req.session.errors = [{ msg: "You already liked this post" }];
    return res.redirect(`/post/details/${id}`);
  }

  //3.Check if the user is the owner of the post
  const isUserThePostAuthor = await isUserPostAuthor(userId, id);

  if (isUserThePostAuthor) {
    return res.render("error_pages/404", {
      errors: [{ msg: "You can't like your own post" }],
    });
  }

  //4. Logic for liking post
  try {
    await likePost(userId, id);

    req.session.successMessage = {
      success: true,
      msg: "Post successfully liked",
    };

    res.redirect(`/post/details/${id}`);
  } catch (err) {
    next(err);
  }
});

likeRouter.post(
  "/dislike/post/:id",
  isAuthenticated(),
  async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user._id;

    //1. Check if post exist
    //2. Check if the post is already liked
    //3.Check if the user is the owner of the post
    //4. Logic for disliking post
  }
);

export default likeRouter;
