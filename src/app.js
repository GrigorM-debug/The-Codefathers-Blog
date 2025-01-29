import express from "express";
import expressConfig from "../config/express.js";
import routes from "../config/routes.js";
import handlebarsConfig from "../config/handlebars.js";
import mongoDbConfig from "../config/mongoDb.js";

const app = express();
const appPort = 3000;

async function start() {
  expressConfig(app);
  routes(app);
  handlebarsConfig(app);
  await mongoDbConfig();

  app.listen(appPort, () => console.log(`Server listening on port ${appPort}`));
}

await start();
