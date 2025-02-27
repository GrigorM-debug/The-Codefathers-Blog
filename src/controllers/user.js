import { Router } from "express";
import { isAuthenticated, isGuest } from "../middlewares/guards.js";
import {
  register,
  login,
  changePassword,
  userExists,
  isPasswordValid,
  newPasswordIsDifferentFromTheOldPassword,
  userExistByUsername,
  userExixtsById,
  getAllUserData,
} from "../services/user.js";
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from "../express-validator/user.js";

import { validationResult } from "express-validator";
import { error } from "jodit/types/core/helpers/index.js";
import { getAllPostsByUserIdNoLimitation } from "../services/post.js";

const userRouter = Router();

userRouter.get("/register", isGuest(), (req, res) => {
  res.render("user/register");
});

userRouter.post(
  "/register",
  isGuest(),
  registerValidator,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/register", {
        errors: errors.array(),
        data: req.body,
      });
    }

    try {
      const userData = {
        username: req.body.username,
        email: req.body.email,
      };

      const isUserExisting = await userExists(userData);

      if (isUserExisting) {
        return res.render("user/register", {
          errors: [{ msg: "User already exists" }],
          data: req.body,
        });
      }

      const token = await register(req.body);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/");
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get("/login", isGuest(), (req, res) => {
  res.render("user/login");
});

userRouter.post("/login", isGuest(), loginValidator, async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("user/login", { errors: errors.array(), data: req.body });
  }

  try {
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    const userExist = await userExists(userData);

    if (!userExist) {
      return res.render("user/login", {
        errors: [{ msg: "User doesn't exist" }],
        data: req.body,
      });
    }

    const isPasswordValidBoolean = await isPasswordValid(userData);

    if (!isPasswordValidBoolean) {
      return res.render("user/login", {
        errors: [{ msg: "Wrong password" }],
        data: req.body,
      });
    }

    const token = await login(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

userRouter.get("/logout", isAuthenticated(), (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

userRouter.get("/changing-password", (req, res) => {
  res.render("user/changing-password");
});

userRouter.post(
  "/changing-password",
  changePasswordValidator,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/changing-password", {
        errors: errors.array(),
        data: req.body,
      });
    }

    try {
      const userExist = await userExistByUsername(req.body.username);

      if (!userExist) {
        return res.render("user/changing-password", {
          errors: [{ msg: "User not found" }],
          data: req.body,
        });
      }

      const isNewPasswordTheSameAsTheOldOne =
        await newPasswordIsDifferentFromTheOldPassword(req.body);

      if (isNewPasswordTheSameAsTheOldOne) {
        return res.render("user/changing-password", {
          errors: [{ msg: "New password can not be the same as your old" }],
          data: req.body,
        });
      }

      await changePassword(req.body);

      const successMessage = {
        success: true,
        msg: "Password changed successfully!",
      };

      res.render("user/login", { success: successMessage });
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get("/profile/:id", isAuthenticated(), async (req, res, next) => {
  const { id } = req.params;
  const loggedInUserId = req.user._id;

  //1. Check if user exists
  const isUserExisting = await userExixtsById(id);

  if (!isUserExisting) {
    return res.render("error_pages/404", {
      errors: [{ msg: "User not found" }],
    });
  }

  //2. Get user data and user posts using Promise.all
  try {
    const [userData, userPosts] = await Promise.all([
      getAllUserData(id),
      getAllPostsByUserIdNoLimitation(id),
    ]);

    const isOwner = loggedInUserId == userData._id;

    console.log(userData);
    console.log(userPosts);

    res.render("user/profile", {
      userData,
      userPosts,
      isOwner,
    });
  } catch (err) {
    next(error);
  }
});

export default userRouter;
