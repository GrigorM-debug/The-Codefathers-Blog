import cookieParser from "cookie-parser";
import express from "express";
import auth from "../src/middlewares/auth.js";

export default function expressConfig(app) {
  const secret = "Cookie parser secret";

  app.use(express.json());
  app.use(cookieParser(secret));
  app.use(express.urlencoded({ extended: true }));
  app.use("/static", express.static("static"));
  app.use(auth());
}
