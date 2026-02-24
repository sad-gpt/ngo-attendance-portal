import Database from "better-sqlite3";

const db = new Database("database.sqlite");

db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in',
  createdAt TEXT DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in',
  createdAt TEXT DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS attendance_children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  childId INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  FOREIGN KEY(childId) REFERENCES children(id) ON DELETE CASCADE,
  UNIQUE(childId, date)
);

CREATE TABLE IF NOT EXISTS attendance_staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staffId INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  FOREIGN KEY(staffId) REFERENCES staff(id) ON DELETE CASCADE,
  UNIQUE(staffId, date)
);

CREATE TABLE IF NOT EXISTS logbook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  personId INTEGER NOT NULL,
  type TEXT NOT NULL,
  reason TEXT,
  exitTime TEXT,
  returnTime TEXT
);

CREATE TABLE IF NOT EXISTS volunteers_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  reason TEXT,
  arrivalTime TEXT NOT NULL,
  departureTime TEXT
);
`);

export default db;
