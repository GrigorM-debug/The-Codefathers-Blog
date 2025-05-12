import "dotenv/config";
import { getLatest3Posts } from "../services/post.js";

export async function homeController(req, res, next) {
  const CHATBASE_SRC = process.env.CHATBASE_SRC;
  const CHATBASE_ID = process.env.CHATBASE_ID;
  const CHATBASE_DOMAIN = process.env.CHATBASE_DOMAIN;

  try {
    const posts = await getLatest3Posts();

    res.render("home", {
      CHATBASE_SRC,
      CHATBASE_ID,
      CHATBASE_DOMAIN,
      latest3Posts: posts,
    });
  } catch (err) {
    next(err);
  }
}
