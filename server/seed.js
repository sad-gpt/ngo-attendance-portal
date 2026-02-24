import bcrypt from "bcryptjs";
import db from "./config/database.js";

const password = bcrypt.hashSync("admin123", 10);

db.prepare(
  "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
).run("Admin", "admin@ngo.com", password, "admin");

// Sample staff entries
db.prepare("INSERT OR IGNORE INTO staff (name, age, email) VALUES (?, ?, ?)").run(
  "Priya Sharma",
  32,
  "priya@ngo.com"
);
db.prepare("INSERT OR IGNORE INTO staff (name, age, email) VALUES (?, ?, ?)").run(
  "Rahul Verma",
  28,
  "rahul@ngo.com"
);
db.prepare("INSERT OR IGNORE INTO staff (name, age, email) VALUES (?, ?, ?)").run(
  "Anita Singh",
  35,
  "anita@ngo.com"
);

console.log("Seeded successfully");
