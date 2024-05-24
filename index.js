import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const port = 4000;

const DATA_FILE = "./posts.json";

// Helper function to read posts from file
const readPostsFromFile = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Helper function to write posts to file
const writePostsToFile = (posts) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  } catch (err) {
    console.error(err);
  }
};

let posts = readPostsFromFile();
let lastId = posts.length > 0 ? Math.max(...posts.map((post) => post.id)) : 0;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CHALLENGE 1: GET All posts
app.get("/posts", (req, res) => {
  res.json(posts);
});

// CHALLENGE 2: GET a specific post by id
app.get("/posts/:id", (req, res) => {
  const post = posts.find((i) => i.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ Message: "post not found" });
  res.json(post);
});

// CHALLENGE 3: POST a new post
app.post("/posts", (req, res) => {
  lastId += 1;
  const post = {
    id: lastId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date().toISOString()
  };
  posts.push(post);
  writePostsToFile(posts);
  res.status(201).json(post);
});

// CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", (req, res) => {
  const post = posts.find((i) => i.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "post not found" });
  if (req.body.title) post.title = req.body.title;
  if (req.body.content) post.content = req.body.content;
  if (req.body.author) post.author = req.body.author;
  writePostsToFile(posts);
  res.json(post);
});

// CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete("/posts/:id", (req, res) => {
  const ind = posts.findIndex((i) => i.id === parseInt(req.params.id));
  if (ind === -1) return res.status(404).json({ message: "post not found" });
  posts.splice(ind, 1);
  writePostsToFile(posts);
  res.json({ message: "post is deleted" });
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
