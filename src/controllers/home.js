import "dotenv/config";

export function homeController(req, res) {
  const CHATBASE_SRC = process.env.CHATBASE_SRC;
  const CHATBASE_ID = process.env.CHATBASE_ID;
  const CHATBASE_DOMAIN = process.env.CHATBASE_DOMAIN;

  res.render("home", { CHATBASE_SRC, CHATBASE_ID, CHATBASE_DOMAIN });
}
