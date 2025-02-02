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

      next();
    } catch (error) {
      res.clearCookie("token");
      return res.redirect("/login");
    }
  };
}
