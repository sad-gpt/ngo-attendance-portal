import bcrypt from "bcryptjs";
import db from "./config/database.js";

const password = bcrypt.hashSync("admin123", 10);

db.prepare(`
INSERT OR IGNORE INTO users (name, email, password, role)
VALUES (?, ?, ?, ?)
`).run("Admin", "admin@ngo.com", password, "admin");

db.prepare(`INSERT OR IGNORE INTO volunteers (name, email, phone, role) VALUES (?, ?, ?, ?)`).run("Priya Sharma", "priya@ngo.com", "9876543210", "Coordinator");
db.prepare(`INSERT OR IGNORE INTO volunteers (name, email, phone, role) VALUES (?, ?, ?, ?)`).run("Rahul Verma", "rahul@ngo.com", "9123456789", "Tutor");
db.prepare(`INSERT OR IGNORE INTO volunteers (name, email, phone, role) VALUES (?, ?, ?, ?)`).run("Anita Singh", "anita@ngo.com", "9988776655", "Social Worker");

console.log("Seeded successfully");
