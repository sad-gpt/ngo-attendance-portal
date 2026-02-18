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
  FOREIGN KEY(childId) REFERENCES children(id),
  UNIQUE(childId, date)
);

CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT
);
`);

// Add unique constraint on existing databases (safe if already exists)
try {
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance (childId, date)");
} catch {
  // Index already exists or duplicate rows present — no-op
}

export default db;
