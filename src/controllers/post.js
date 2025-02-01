import { Router } from "express";
import { isAuthenticated } from "../middlewares/guards.js";

const postRouter = Router();

postRouter.get("/create", isAuthenticated(), (req, res) => {
  res.render("create");
});

export default postRouter;
