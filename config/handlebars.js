import handlebars from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

export default function handlebarsConfig(app) {
  const hbs = handlebars.create({
    extname: "hbs",
    helpers: {
      eq: (a, b) => a === b,
    },
  });

  const __dirname = dirname(fileURLToPath(import.meta.url));

  app.engine(".hbs", hbs.engine);
  app.set("view engine", ".hbs");
  app.set("views", path.join(__dirname, "../src/views"));
}
