import express from "express";
import expressConfig from "../config/express.js";
import routes from "../config/routes.js";
import handlebarsConfig from "../config/handlebars.js";
import mongoDbConfig from "../config/mongoDb.js";
import "dotenv/config";

import { handleSocketConnection } from "./controllers/socket.js";
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

handleSocketConnection(io);

const app = express();
const appPort = process.env.PORT;

async function start() {
  expressConfig(app);
  routes(app);
  handlebarsConfig(app);
  await mongoDbConfig();

  app.listen(appPort, () => console.log(`Server listening on port ${appPort}`));
}

await start();
