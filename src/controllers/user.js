import { Router } from "express";
import { isAuthenticated, isGuest } from "../middlewares/guards.js";
import { register, login } from "../services/user.js";
import {
  registerValidator,
  loginValidator,
} from "../express-validator/user.js";

import { validationResult } from "express-validator";

const userRouter = Router();

userRouter.get("/register", isGuest(), (req, res) => {
  res.render("register");
});

userRouter.post("/register", isGuest(), registerValidator, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("register", { errors: errors.array(), data: req.body });
  }

  try {
    const token = await register(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("register", {
      errors: [{ msg: error.message }],
      data: req.body,
    });
    return;
  }
});

userRouter.get("/login", isGuest(), (req, res) => {
  res.render("login");
});

userRouter.post("/login", isGuest(), loginValidator, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("login", { errors: errors.array(), data: req.body });
  }

  try {
    const token = await login(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.render("login", { errors: [{ msg: error.message }], data: req.body });
    return;
  }
});

userRouter.get("/logout", isAuthenticated(), (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

export default userRouter;
