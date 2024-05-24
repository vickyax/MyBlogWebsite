import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const DATA_FILE = './posts.json';

// Helper function to read posts from file
const readPostsFromFile = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
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
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to render the main page
app.get('/', async (req, res) => {
  try {
    res.render('index', { posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Route to render the edit page
app.get('/new', (req, res) => {
  res.render('modify', { heading: 'New Post', submit: 'Create Post' });
});

app.get('/edit/:id', async (req, res) => {
  try {
    const post = posts.find((i) => i.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.render('modify', {
      heading: 'Edit Post',
      submit: 'Update Post',
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  try {
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
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Partially update a post
app.post('/api/posts/:id', async (req, res) => {
  try {
    const post = posts.find((i) => i.id === parseInt(req.params.id));
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.author) post.author = req.body.author;
    writePostsToFile(posts);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete a post
app.get('/api/posts/delete/:id', async (req, res) => {
  try {
    const ind = posts.findIndex((i) => i.id === parseInt(req.params.id));
    if (ind === -1) return res.status(404).json({ message: 'Post not found' });
    posts.splice(ind, 1);
    writePostsToFile(posts);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// CHALLENGE 1: GET All posts
app.get('/posts', (req, res) => {
  res.json(posts);
});

// CHALLENGE 2: GET a specific post by id
app.get('/posts/:id', (req, res) => {
  const post = posts.find((i) => i.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// CHALLENGE 3: POST a new post
app.post('/posts', (req, res) => {
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
app.patch('/posts/:id', (req, res) => {
  const post = posts.find((i) => i.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (req.body.title) post.title = req.body.title;
  if (req.body.content) post.content = req.body.content;
  if (req.body.author) post.author = req.body.author;
  writePostsToFile(posts);
  res.json(post);
});

// CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete('/posts/:id', (req, res) => {
  const ind = posts.findIndex((i) => i.id === parseInt(req.params.id));
  if (ind === -1) return res.status(404).json({ message: 'Post not found' });
  posts.splice(ind, 1);
  writePostsToFile(posts);
  res.json({ message: 'Post is deleted' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
