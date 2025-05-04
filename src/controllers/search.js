import { Router } from "express";
import { findPostByName, findUserByUserName } from "../services/search.js";

const searchRouter = Router()

searchRouter.post('/search', async (req, res, next) => {
    const {searchString} = req.body

    console.log(searchString)

    //Validate the search string
    if(!searchString || searchString.trim() === '') {
        return res.render("error_pages/404");
    }

    try {
        const [posts, users] = await Promise.all([
            findPostByName(searchString),
            findUserByUserName(searchString)
        ])

        if((!posts || posts.length === 0) && (!users || users.length === 0)) {
            return res.render("error_pages/404");
        }

        res.render('search/search_result', {posts, users, searchString})
    } catch (err) {
        next(err);
    }
    
})

export default searchRouter;