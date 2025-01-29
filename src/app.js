import express from "express";
import expressConfig from "../config/express.js";
import handlebarsConfig from "../config/handlebars.js";
import mongoDbConfig from "../config/mongoDb.js";

const app = express();
const appPort = 3000;

async function start() {
  expressConfig(app);
  handlebarsConfig(app);
  await mongoDbConfig();

  app.listen(appPort, () => 
    console.log(`Server listening on port ${appPort}`));
}

await start();
