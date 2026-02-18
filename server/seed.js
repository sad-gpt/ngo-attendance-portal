import bcrypt from "bcryptjs";
import db from "./config/database.js";

const password = bcrypt.hashSync("admin123", 10);

db.prepare(`
INSERT OR IGNORE INTO users (name, email, password, role)
VALUES (?, ?, ?, ?)
`).run("Admin", "admin@ngo.com", password, "admin");

console.log("Seeded successfully");
