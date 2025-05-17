import cookieParser from "cookie-parser";
import express from "express";
import auth from "../src/middlewares/auth.js";
import errorHandler from "../src/middlewares/errorHandler.js";
import session from "express-session";
// import { handleSocketConnection } from "../src/controllers/socket.js";
// import { createServer } from "http";
// import { Server } from "socket.io";

export default function expressConfig(app) {
  // const httpServer = createServer();
  // const io = new Server(httpServer, {
  //   cors: {
  //     origin: "*",
  //   },
  // });
  // handleSocketConnection(io);
  const secret = "Cookie parser secret";

  app.use(express.json());
  app.use(cookieParser(secret));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    express.static("static", {
      setHeaders: (res, path) => {
        if (path.endsWith(".css")) {
          res.set("Content-Type", "text/css");
        }
      },
    })
  );
  app.use(
    session({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(auth());
  app.use(errorHandler());
}
