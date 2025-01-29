import cookieParser from "cookie-parser";
import express from "express";

export default function expressConfig(app) {
  const secret = "Cookie parser secret";

  app.use(express.json());
  app.use(cookieParser(secret));
  app.use(express.urlencoded({ extended: true }));
  app.use("/static", express.static("static"));
}
