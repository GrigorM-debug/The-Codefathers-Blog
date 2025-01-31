import { homeController } from "../src/controllers/home.js";
import userRouter from "../src/controllers/user.js";
import contactRouter from "../src/controllers/contact.js";

export default function routes(app) {
  app.get("/", homeController);
  app.use(contactRouter);
  app.use(userRouter);
}
