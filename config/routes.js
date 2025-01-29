import { homeController } from "../src/controllers/home.js";

export default function routes(app) {
  app.use("/", homeController);
}
