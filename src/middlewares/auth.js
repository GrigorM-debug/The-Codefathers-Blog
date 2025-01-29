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
      req.isAuthenticated = true;
      next();
    } catch (error) {
      res.clearCookie("token");
      return res.redirect("/login");
    }
  };
}
