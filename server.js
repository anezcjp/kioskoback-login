const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

require("dotenv").config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "test",
});

const port = process.env.PORT || 3400;

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err);
    return;
  }
  console.log("Connected to MySQL");
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Error checking for existing user: " + err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password],
      (err, results) => {
        if (err) {
          console.error("Error inserting user into database: " + err);
          return res.status(500).json({ error: "Internal server error" });
        }

        console.log(`New user registered: ${username}, ${email}`);
        res.status(200).json({ message: "Registration successful" });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        console.error("Error checking user credentials: " + err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 1) {
        console.log(`User logged in: ${username}`);
        return res.status(200).json({ message: "Login successful" });
      } else {
        console.log(`Login failed for user: ${username}`);
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
  );
});

app.post("/recovery", (req, res) => {
  const { username } = req.body;

  db.query(
    "SELECT email FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Error checking username: " + err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 1) {
        const email = results[0].email;
        console.log(`Email retrieved for username ${username}: ${email}`);
        return res.status(200).json({ email });
      } else {
        console.log(`Username not found: ${username}`);
        return res.status(404).json({ error: "Username not found" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
