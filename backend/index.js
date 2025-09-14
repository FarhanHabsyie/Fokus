const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const path = require("path");   // <-- tambah ini

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// 🔥 serve frontend dari folder ../public
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ======================
// AUTH & API ENDPOINTS
// ======================

// Register
app.post("/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email & password wajib" });

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: "Error hashing" });
    db.run(
      "INSERT INTO users (email, password, name) VALUES (?,?,?)",
      [email, hash, name || ""],
      function (err) {
        if (err) return res.status(400).json({ error: "Email sudah dipakai" });
        const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, {
          expiresIn: "7d",
        });
        res.json({ id: this.lastID, email, name, token });
      }
    );
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    bcrypt.compare(password, user.password, (err, same) => {
      if (!same) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.json({ id: user.id, email: user.email, name: user.name, token });
    });
  });
});

// Middleware cek login
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  try {
    const { userId } = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Get posts
app.get("/posts", (req, res) => {
  db.all("SELECT * FROM posts ORDER BY id DESC", [], (err, rows) => {
    res.json(rows);
  });
});

// Create post
app.post("/posts", requireAuth, (req, res) => {
  const { title, content } = req.body;
  db.run(
    "INSERT INTO posts (title, content, authorId) VALUES (?,?,?)",
    [title, content, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ id: this.lastID, title, content });
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server jalan di http://localhost:${PORT}`)
);

