import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";
import { postValidator } from "../express-validator/post.js";
import { validationResult } from "express-validator";

const postRouter = Router();

postRouter.get("/create", isAuthenticated(), (req, res) => {
  res.render("create");
});

postRouter.post(
  "/create",
  isAuthenticated(),
  postValidator,
  async (req, res) => {
    //TODO: Implement post creation
    console.log(req.body);
  }
);

export default postRouter;
