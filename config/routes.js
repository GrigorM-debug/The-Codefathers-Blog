import { homeController } from "../src/controllers/home.js";
import userRouter from "../src/controllers/user.js";
import contactRouter from "../src/controllers/contact.js";
import postRouter from "../src/controllers/post.js";

export default function routes(app) {
  app.get("/", homeController);
  app.use(contactRouter);
  app.use(userRouter);
  app.use(postRouter);
  app.get("/404", (req, res) => res.render("404"));
}
