import Database from "better-sqlite3";

const db = new Database("database.sqlite");

// Create tables if not exist
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  class TEXT,
  age INTEGER,
  gender TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  childId INTEGER,
  date TEXT,
  status TEXT,
  FOREIGN KEY(childId) REFERENCES children(id)
);

CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT
);
`);

export default db;
