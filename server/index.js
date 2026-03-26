const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      input TEXT NOT NULL,
      score INTEGER NOT NULL,
      level TEXT NOT NULL,
      module TEXT,
      reasons TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      fraudType TEXT NOT NULL,
      name TEXT,
      date TEXT,
      amount TEXT,
      platform TEXT,
      scammerDetails TEXT,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
  }
});

// --- API ROUTES ---

// 1. Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }

  const avatar = name.charAt(0).toUpperCase();

  const query = `INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, email.toLowerCase(), password, avatar], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Return user object (excluding password)
    res.status(201).json({
      user: {
        id: this.lastID,
        name,
        email: email.toLowerCase(),
        avatar,
        joinedAt: new Date().toISOString()
      }
    });
  });
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email.toLowerCase()], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.password !== password) return res.status(401).json({ error: 'Incorrect password' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        joinedAt: user.joinedAt
      }
    });
  });
});

// 3. Scans: Get User History
app.get('/api/scans/:userId', (req, res) => {
  const { userId } = req.params;
  const limits = req.query.limit ? `LIMIT ${req.query.limit}` : '';
  
  const query = `SELECT * FROM scans WHERE userId = ? ORDER BY createdAt DESC ${limits}`;
  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    // Parse reasons string back to array
    const scans = rows.map(r => ({
      ...r,
      reasons: r.reasons ? JSON.parse(r.reasons) : []
    }));
    
    res.json(scans);
  });
});

// 4. Scans: Save Scan
app.post('/api/scans', (req, res) => {
  const { userId, input, score, level, module, reasons } = req.body;
  
  const query = `INSERT INTO scans (userId, input, score, level, module, reasons) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [userId, input, score, level, module, JSON.stringify(reasons || [])], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    res.status(201).json({ id: this.lastID, message: 'Scan saved' });
  });
});

// 5. Complaints: Save Complaint
app.post('/api/complaints', (req, res) => {
  const { userId, fraudType, name, date, amount, platform, scammerDetails, description } = req.body;
  
  const query = `INSERT INTO complaints (userId, fraudType, name, date, amount, platform, scammerDetails, description) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                 
  db.run(query, [userId, fraudType, name, date, amount, platform, scammerDetails, description], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ id: this.lastID, message: 'Complaint saved successfully' });
  });
});

// 6. Complaints: Get User Complaints
app.get('/api/complaints/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `SELECT * FROM complaints WHERE userId = ? ORDER BY createdAt DESC`;
  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
