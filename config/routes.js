import { homeController } from "../src/controllers/home.js";
import userRouter from "../src/controllers/user.js";
import contactRouter from "../src/controllers/contact.js";
import postRouter from "../src/controllers/post.js";
import commentRouter from "../src/controllers/comment.js";
import likeRouter from "../src/controllers/like.js";
import roomRouter from "../src/controllers/room.js";

export default function routes(app) {
  app.get("/", homeController);
  app.use(contactRouter);
  app.use(userRouter);
  app.use(postRouter);
  app.use(commentRouter);
  app.use(likeRouter);
  app.use(roomRouter);
  app.get("/404", (req, res) => res.render("error_pages/404"));
  app.all("*", (req, res) => {
    res.render("error_pages/404");
  });
}
