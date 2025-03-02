import { Router } from "express";
import { contactValidator } from "../express-validator/contact.js";
import { validationResult } from "express-validator";
import sendEmail from "../services/contact.js";

import { csrfSync } from "csrf-sync";

const { generateToken } = csrfSync();

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    console.log(req.body._csrf);
    return req.body["_csrf"];
  }, // Used to retrieve the token submitted by the user in a form
});

const contactRouter = Router();

contactRouter.get("/contact", (req, res) => {
  const csrfToken = generateToken(req, true);
  res.render("contact", { csrfToken });
});

contactRouter.post(
  "/contact",
  csrfSynchronisedProtection,
  contactValidator,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("contact", { errors: errors.array(), data: req.body });
    }

    try {
      await sendEmail(req.body);
      res.render("contact", {
        success: true,
        msg: "Email sent successfully !",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default contactRouter;
