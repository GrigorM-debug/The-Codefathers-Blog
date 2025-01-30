import { homeController } from "../src/controllers/home.js";
import userRouter from "../src/controllers/user.js";

export default function routes(app) {
  app.get("/", homeController);
  app.use(userRouter);
}
