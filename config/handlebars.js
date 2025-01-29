import handlebars from "express-handlebars";

export default function handlebarsConfig(app) {
  const hbs = handlebars.create({
    extname: "hbs",
  });

  app.engine(".hbs", hbs.engine);
  app.set("view engine", ".hbs");
}
