const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("fokus.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      authorId INTEGER,
      FOREIGN KEY(authorId) REFERENCES users(id)
    )
  `);
});

module.exports = db;
