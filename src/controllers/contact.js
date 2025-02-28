import { Router } from "express";
import { contactValidator } from "../express-validator/contact.js";
import { validationResult } from "express-validator";
import sendEmail from "../services/contact.js";

const contactRouter = Router();

contactRouter.get("/contact", (req, res) => {
  res.render("contact");
});

contactRouter.post("/contact", contactValidator, async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("contact", { errors: errors.array(), data: req.body });
  }

  try {
    await sendEmail(req.body);
    res.render("contact", { success: true, msg: "Email sent successfully !" });
  } catch (error) {
    next(error);
  }
});

export default contactRouter;
