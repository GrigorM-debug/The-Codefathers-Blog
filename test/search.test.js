import { MongoMemoryServer } from "mongodb-memory-server";
import { createPost } from "../src/services/post.js";
import { register } from "../src/services/user.js";
import { describe, it } from "mocha";
import { findPostByName, findUserByUserName } from "../src/services/search.js";
import { expect } from "chai";

let mongodbServer;

const user1 = {
  username: "Ivan6740",
  email: "ivan@abv.bg",
  password: "12345678",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
  createdAt: new Date(),
};

const user2 = {
  username: "Ivan674030",
  email: "ivanP@abv.bg",
  password: "12345678",
  imageUrl: "https://example.com/image.jpg",
  description: "Developer from New York. Working in Apple",
  createdAt: new Date(),
};

const post1 = {
  title: "Test post title",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  createdAt: new Date(),
}

const post2 = {
  title: "Test post title2",
  content:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  bannerImageUrl: "https://example.com/image.jpg",
  createdAt: new Date(),
}

describe("Search service unit tests", () => {
  before(async () => {
    mongodbServer = await MongoMemoryServer.create();
    await mongoose.connect(mongodbServer.getUri());

    const token =  await register(user1);
    const token2 = await register(user2);

    const post1Completed = {
      ...post1,
      author: token._id
    }

    const post2Completed = {
      ...post2,
      author: token._id
    }

    await createPost(post1Completed)
    await createPost(post2Completed)
  })

  after(async () => {
    await mongoose.connection.close();
    await mongodbServer.stop();
  });

  it("findPostByName: Should return null if post name is empty string", async () => {
    const postTitle = ""

    const post = await findPostByName(postTitle)

    expect(post).to.be.null;
  })

  it("findPostByName: Should return empty array if post doesn't exist", async () => {
    const postTitle = "Post title";

    const posts = await findPostByName(postTitle);

    expect(posts).to.be.an("array").that.is.empty
  })

  it("findPostByName: Should return the posts if they exists", async () => {
    const posts = await findPostByName(post1.title);
    
    expect(posts).to.be.an("array").that.is.not.empty;
    expect(posts).to.have.lengthOf(1);
    expect(posts[0]).to.deep.include({
      title: post1.title,
      content: post1.content,
      bannerImageUrl: post1.bannerImageUrl
    })
  })

  it("findPostByName: Should return multiple posts if their title is equal to the searchString paramether", async () => {
    const searchString = "Test post";

    const posts = await findPostByName(searchString);

    expect(posts).to.be.an("array").that.is.not.empty;
    expect(posts).to.have.lengthOf(2);
    xpect(posts[0]).to.deep.include({
      title: post1.title,
      content: post1.content,
      bannerImageUrl: post1.bannerImageUrl
    })

    expect(posts[1]).to.deep.include({
      title: post2.title,
      content: post2.content,
      bannerImageUrl: post2.bannerImageUrl
    })
  })

  it("findPostByName: Should find post when search string is lowercase", async () => {
    const searchString = "test post title";  // lowercase version

    const posts = await findPostByName(searchString);

    expect(posts).to.be.an("array").that.is.not.empty;
    expect(posts).to.have.lengthOf(1);
    expect(posts[0]).to.deep.include({
        title: post1.title,  // original case "Test post title"
        content: post1.content,
        bannerImageUrl: post1.bannerImageUrl
    });
  });

  
  it("findPostByName: Should find post when search string is uppercase", async () => {
    const searchString = "TEST POST TITLE";  // uppercase version

    const posts = await findPostByName(searchString);

    expect(posts).to.be.an("array").that.is.not.empty;
    expect(posts).to.have.lengthOf(1);
    expect(posts[0]).to.deep.include({
        title: post1.title,  // original case "Test post title"
        content: post1.content,
        bannerImageUrl: post1.bannerImageUrl
    });
  });

  it("findPostByName: Should find multiple posts with mixed case search", async () => {
    const searchString = "TeSt PoSt";  // mixed case

    const posts = await findPostByName(searchString);

    expect(posts).to.be.an("array").that.is.not.empty;
    expect(posts).to.have.lengthOf(2);
    expect(posts[0]).to.deep.include({
        title: post1.title,
        content: post1.content,
        bannerImageUrl: post1.bannerImageUrl
    });
    expect(posts[1]).to.deep.include({
        title: post2.title,
        content: post2.content,
        bannerImageUrl: post2.bannerImageUrl
    });
  });

  it("findUserByUserName: Should return null if username is empty string", async () => {
    const searchString = "";

    const users = await findUserByUserName(searchString);

    expect(users).to.be.null;
  });

  it("findUserByUserName: Should return empty array if user doesn't exist", async () => {
    const searchString = "NonExistentUser";

    const users = await findUserByUserName(searchString);

    expect(users).to.be.an("array").that.is.empty;
  });

  it("findUserByUserName: Should return the user if they exist", async () => {
    const users = await findUserByUserName(user1.username);

    expect(users).to.be.an("array").that.is.not.empty;
    expect(users).to.have.lengthOf(1);
    expect(users[0]).to.deep.include({
        username: user1.username,
        email: user1.email,
        imageUrl: user1.imageUrl
    });
  });

  it("findUserByUserName: Should return multiple users if their username matches the searchString parameter", async () => {
    const searchString = "Ivan";  // This will match both user1 and user2

    const users = await findUserByUserName(searchString);

    expect(users).to.be.an("array").that.is.not.empty;
    expect(users).to.have.lengthOf(2);
    expect(users[0]).to.deep.include({
        username: user1.username,
        email: user1.email,
        imageUrl: user1.imageUrl
    });
    expect(users[1]).to.deep.include({
        username: user2.username,
        email: user2.email,
        imageUrl: user2.imageUrl
    });
  });

  it("findUserByUserName: Should find user when search string is lowercase", async () => {
    const searchString = "ivan6740";  // lowercase version

    const users = await findUserByUserName(searchString);

    expect(users).to.be.an("array").that.is.not.empty;
    expect(users).to.have.lengthOf(1);
    expect(users[0]).to.deep.include({
        username: user1.username,  // original case "Ivan6740"
        email: user1.email,
        imageUrl: user1.imageUrl
    });
  });

  it("findUserByUserName: Should find user when search string is uppercase", async () => {
    const searchString = "IVAN6740";  // uppercase version

    const users = await findUserByUserName(searchString);

    expect(users).to.be.an("array").that.is.not.empty;
    expect(users).to.have.lengthOf(1);
    expect(users[0]).to.deep.include({
        username: user1.username,  // original case "Ivan6740"
        email: user1.email,
        imageUrl: user1.imageUrl
    });
  });

  it("findUserByUserName: Should find multiple users with mixed case search", async () => {
    const searchString = "IvAn";  // mixed case

    const users = await findUserByUserName(searchString);

    expect(users).to.be.an("array").that.is.not.empty;
    expect(users).to.have.lengthOf(2);
    expect(users[0]).to.deep.include({
        username: user1.username,
        email: user1.email,
        imageUrl: user1.imageUrl
    });
    expect(users[1]).to.deep.include({
        username: user2.username,
        email: user2.email,
        imageUrl: user2.imageUrl
    });
  });
})