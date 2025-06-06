import { verifyToken } from "../services/jwt.js";

export default function auth() {
  return (req, res, next) => {
    const token = req.cookies["token"];

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      res.locals.isAuthenticated = true;
      res.locals.username = decoded.username;
      res.locals.imageUrl = decoded.imageUrl;
      res.locals.userId = decoded._id;

      next();
    } catch (error) {
      res.clearCookie("token");
      console.log(error.message);
      return res.redirect("/login");
    }
  };
}
