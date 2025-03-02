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
  getUserFollowersByUserId,
  checkIfUserFollowsAnotherUser,
  followUser,
  getUserFollowingsByUserId,
  unfollowUser,
  getUserFollowingsIdsByUserId,
  updateUser,
} from "../services/user.js";
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from "../express-validator/user.js";

import { validationResult } from "express-validator";
import {
  getAllPostsByUserIdNoLimitation,
  getFollowingsPosts,
} from "../services/post.js";
import { editValidator } from "../express-validator/user.js";

import { csrfSync } from "csrf-sync";

const { generateToken } = csrfSync();

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    console.log(req.body._csrf);
    return req.body["_csrf"];
  }, // Used to retrieve the token submitted by the user in a form
});

const userRouter = Router();

userRouter.get("/register", isGuest(), (req, res) => {
  const csrfToken = generateToken(req, true);
  res.render("user/register", { csrfToken });
});

userRouter.post(
  "/register",
  isGuest(),
  csrfSynchronisedProtection,
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
        // secure: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/");
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get("/login", isGuest(), (req, res) => {
  const csrfToken = generateToken(req, true);
  res.render("user/login", { csrfToken });
});

userRouter.post(
  "/login",
  isGuest(),
  csrfSynchronisedProtection,
  loginValidator,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/login", {
        errors: errors.array(),
        data: req.body,
      });
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
        // secure: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/");
    } catch (error) {
      next(error);
    }
  }
);

userRouter.get("/logout", isAuthenticated(), (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

userRouter.get("/changing-password", isGuest(), (req, res) => {
  const csrfToken = generateToken(req, true);
  res.render("user/changing-password", { csrfToken });
});

userRouter.post(
  "/changing-password",
  isGuest(),
  csrfSynchronisedProtection,
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

  const errors = req.session.errors || [];
  delete req.session.errors;

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

    const followers = req.session.followers || [];

    let isFollowed = false;
    if (!isOwner) {
      const isFollowedObj = await checkIfUserFollowsAnotherUser(
        loggedInUserId,
        id
      );
      if (isFollowedObj) {
        isFollowed = true;
      }
    }

    let showPostsSectionHandler = true;

    let showFollowersSectionHandler;

    if (
      req.session.showFollowersSection &&
      req.session.showFollowersSection === true
    ) {
      showFollowersSectionHandler = true;
      showPostsSectionHandler = false;
    } else {
      showFollowersSectionHandler = false;
      // showPostsSectionHandler = true;
    }

    delete req.session.showFollowersSection;

    const followings = req.session.followings || [];

    let showFollowingsSectionHandler;

    if (
      req.session.showFollowingsSection &&
      req.session.showFollowingsSection === true
    ) {
      showFollowingsSectionHandler = true;
      showPostsSectionHandler = false;
    } else {
      showFollowingsSectionHandler = false;
      // showPostsSectionHandler = true;
    }

    delete req.session.showFollowingsSection;

    res.render("user/profile", {
      userData,
      userPosts,
      isOwner,
      isFollowed,
      followers,
      errors,
      showFollowersSectionHandler,
      showPostsSectionHandler,
      followings,
      showFollowingsSectionHandler,
    });
  } catch (err) {
    next(error);
  }
});

//One user follows another user
userRouter.post(
  "/follow/user/:id",
  isAuthenticated(),
  async (req, res, next) => {
    //The id of the user that current user want to follow
    const { id } = req.params;
    const currentUserId = req.user._id;

    //Check if current user id and another user id are the same
    if (id == currentUserId) {
      req.session.errors = [{ msg: "You can't follow yourself" }];
      return res.redirect(`/profile/${id}`);
    }

    //Check if another user exists
    const isUserExisting = await userExixtsById(id);

    if (!isUserExisting) {
      return res.render("error_pages/404", {
        errors: [{ msg: "User not found" }],
      });
    }

    //Check if current user already followed the another user
    const isFollowing = await checkIfUserFollowsAnotherUser(currentUserId, id);

    if (isFollowing) {
      req.session.errors = [{ msg: "You already followed this user" }];
      return res.redirect(`/profile/${id}`);
    }

    try {
      await followUser(currentUserId, id);

      req.session.successMessage = {
        success: true,
        msg: "User successfully followed",
      };

      res.redirect(`/profile/${currentUserId}/followings`);
    } catch (err) {
      next(err);
    }
  }
);

//One user unfollows other user
userRouter.post(
  "/unfollow/user/:id",
  isAuthenticated(),
  async (req, res, next) => {
    //The id of the user that current user want to follow
    const { id } = req.params;
    const currentUserId = req.user._id;

    //Check if current user id and another user id are the same
    if (id == currentUserId) {
      req.session.errors = [{ msg: "You can't unfollow yourself" }];
      return res.redirect(`/profile/${id}`);
    }

    //Check if another user exists
    const isUserExisting = await userExixtsById(id);

    if (!isUserExisting) {
      return res.render("error_pages/404", {
        errors: [{ msg: "User not found" }],
      });
    }

    //Check if current user following the another user
    const isFollowing = await checkIfUserFollowsAnotherUser(currentUserId, id);

    if (!isFollowing) {
      req.session.errors = [
        { msg: "You can't unfollow user that you are not following" },
      ];
      return res.redirect(`/profile/${id}`);
    }

    try {
      await unfollowUser(currentUserId, id);

      req.session.successMessage = {
        success: true,
        msg: "User successfully unfollowed",
      };

      res.redirect(`/profile/${currentUserId}/followings`);
    } catch (err) {
      next(err);
    }
  }
);

//Get user followers
userRouter.get(
  "/profile/:id/followers",
  isAuthenticated(),
  async (req, res, next) => {
    const { id } = req.params;

    //Check if user exists
    const isUserExisting = await userExixtsById(id);

    if (!isUserExisting) {
      return res.render("error_pages/404", {
        errors: [{ msg: "User not found" }],
      });
    }

    //Get user followers
    try {
      const followers = await getUserFollowersByUserId(id);

      req.session.followers = followers;

      req.session.showFollowersSection = true;

      res.redirect(`/profile/${id}`);
    } catch (err) {
      next(err);
    }
  }
);

//Get user followings
userRouter.get(
  "/profile/:id/followings",
  isAuthenticated(),
  async (req, res, next) => {
    const { id } = req.params;

    //Check if user exists
    const isUserExisting = await userExixtsById(id);

    if (!isUserExisting) {
      return res.render("error_pages/404", {
        errors: [{ msg: "User not found" }],
      });
    }

    //Get user followings
    try {
      const followings = await getUserFollowingsByUserId(id);

      req.session.followings = followings;

      req.session.showFollowingsSection = true;

      res.redirect(`/profile/${id}`);
    } catch (err) {
      next(err);
    }
  }
);

//Get the posts of the users that current user is following
userRouter.get("/following", isAuthenticated(), async (req, res, next) => {
  const currentUserId = req.user._id;

  try {
    const currentUserFollowings =
      await getUserFollowingsIdsByUserId(currentUserId);

    let followingsPosts = [];

    if (currentUserFollowings) {
      followingsPosts = await getFollowingsPosts(currentUserFollowings);
    }

    res.render("post/following", { followingsPosts });
  } catch (err) {
    next(err);
  }
});

//Edit user profile Get
userRouter.get(
  "/edit_profile/:id",
  isAuthenticated(),
  async (req, res, next) => {
    const { id } = req.params;

    //1. Check if user exists
    const isUserExisting = await userExixtsById(id);

    if (!isUserExisting) {
      return res.render("error_pages/404", {
        errors: [{ msg: "User not found" }],
      });
    }

    try {
      //2. Get the user data
      const userData = await getAllUserData(id);

      //3. Send the data to the view
      const csrfToken = generateToken(req, true);
      res.render("user/edit_profile", { userData, csrfToken });
    } catch (err) {
      next(err);
    }
  }
);

//Edit user profile Post
userRouter.post(
  "/edit_profile/:id",
  isAuthenticated(),
  csrfSynchronisedProtection,
  editValidator,
  async (req, res, next) => {
    const { id } = req.params;

    //1. Check if user exists
    const isUserExisting = await userExixtsById(id);
    if (!isUserExisting) {
      return res.render("error_pages/404", {
        errors: [{ msg: "User not found" }],
      });
    }

    //3. Validate the form data
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/edit_profile", {
        errors: errors.array(),
        userData: req.body,
      });
    }

    //4. Update the user data
    //5. Redirect to the profile page
    try {
      await updateUser(id, req.body);

      res.redirect(`/profile/${id}`);
    } catch (err) {
      next(err);
    }
  }
);

export default userRouter;
