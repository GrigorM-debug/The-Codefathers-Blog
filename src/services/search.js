import Post from '../models/Post.js';
import User from '../models/User.js';

async function findPostByName(searchString) {
    if (!searchString || searchString.trim() === '') {
        return null;
    }

    const posts = await Post.find({
        title: { $regex: searchString, $options: 'i' } 
    }).select('title createdAt bannnerImageUrl author')
      .populate('author', 'username')
      .lean()

    posts.forEach((post) => {
        post.createdAt = post.createdAt.toLocaleString();
    });

    return posts;
}

async function findUserByUserName(searchString) {
    if(!searchString || searchString.trim() === '') {
        return null;
    }

    const users = await User.find({
        username: {$regex: searchString, $options: 'i'}
    }).select('username imageUrl createdAt email')
    .lean()

    users.forEach((user) => {
        user.createdAt = user.createdAt.toLocaleString();
    })

    return users;
}

export { findPostByName, findUserByUserName };