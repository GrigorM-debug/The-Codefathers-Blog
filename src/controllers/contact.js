import { Router } from "express";

const contactRouter = Router();

contactRouter.get("/contact", (req, res) => {
  res.render("contact");
});

export default contactRouter;
