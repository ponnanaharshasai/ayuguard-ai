const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.JWT_SECRET || 'ayuguard_secret_key_2025';

app.use(cors());
app.use(express.json());

/* ═══════════════════════════════════════════════════════════════════════════
   DATABASE SETUP — Proper Normalized Schema
   ═══════════════════════════════════════════════════════════════════════════ */
const dbPath = path.resolve(__dirname, 'ayuguard.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('DB Connection Error:', err.message);
  console.log('✅ Connected to SQLite database at:', dbPath);
  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');
  initDb();
});

function initDb() {
  db.serialize(() => {
    // ── Users ────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name     TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      phone         TEXT,
      password_hash TEXT    NOT NULL,
      age           INTEGER,
      preferred_language TEXT DEFAULT 'en',
      created_at    TEXT    DEFAULT (datetime('now')),
      updated_at    TEXT    DEFAULT (datetime('now'))
    )`);

    // ── Medicines ────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS medicines (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      name          TEXT    NOT NULL,
      dosage        TEXT    NOT NULL,
      type          TEXT    DEFAULT 'tablet',
      frequency     TEXT    DEFAULT 'daily',
      times_per_day INTEGER DEFAULT 1,
      time_slots    TEXT,
      instructions  TEXT    DEFAULT 'after meal',
      stock_count   INTEGER DEFAULT 30,
      refill_threshold INTEGER DEFAULT 7,
      pill_shape    TEXT    DEFAULT 'round',
      pill_color    TEXT    DEFAULT '#3b82f6',
      is_active     INTEGER DEFAULT 1,
      start_date    TEXT    DEFAULT (date('now')),
      end_date      TEXT,
      created_at    TEXT    DEFAULT (datetime('now')),
      updated_at    TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // ── Schedules (generated daily entries) ──────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS schedules (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      medicine_id   INTEGER NOT NULL,
      scheduled_date TEXT   NOT NULL,
      scheduled_time TEXT   NOT NULL,
      status        TEXT    DEFAULT 'pending',
      taken_at      TEXT,
      skipped_reason TEXT,
      created_at    TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
      UNIQUE(medicine_id, scheduled_date, scheduled_time)
    )`);

    // ── Vitals ──────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS vitals (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      type          TEXT    NOT NULL,
      value         REAL    NOT NULL,
      value2        REAL,
      unit          TEXT    NOT NULL,
      notes         TEXT,
      recorded_at   TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // ── Adherence Summary (daily rollup) ────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS adherence_daily (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      date          TEXT    NOT NULL,
      total_doses   INTEGER DEFAULT 0,
      taken_doses   INTEGER DEFAULT 0,
      missed_doses  INTEGER DEFAULT 0,
      score         REAL    DEFAULT 0.0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )`);

    // ── Alerts / Notifications ──────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS alerts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      type          TEXT    NOT NULL,
      severity      TEXT    DEFAULT 'info',
      title         TEXT    NOT NULL,
      message       TEXT,
      is_read       INTEGER DEFAULT 0,
      related_id    INTEGER,
      created_at    TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // ── Chat History ────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL,
      role          TEXT    NOT NULL,
      content       TEXT    NOT NULL,
      language      TEXT    DEFAULT 'en',
      created_at    TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // ── Indexes for performance ─────────────────────────────────────────
    db.run(`CREATE INDEX IF NOT EXISTS idx_medicines_user    ON medicines(user_id, is_active)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_schedules_user    ON schedules(user_id, scheduled_date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_schedules_status  ON schedules(status, scheduled_date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_vitals_user       ON vitals(user_id, type, recorded_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_adherence_user    ON adherence_daily(user_id, date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_alerts_user       ON alerts(user_id, is_read, created_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_chat_user         ON chat_messages(user_id, created_at)`);

    console.log('✅ Database schema initialized');
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

// Simple password hashing (bcrypt-like with built-in crypto)
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === verify;
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   MIDDLEWARE
   ═══════════════════════════════════════════════════════════════════════════ */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUTH ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { full_name, email, phone, password, age, preferred_language } = req.body;
    
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email exists
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const password_hash = hashPassword(password);
    const result = await dbRun(
      `INSERT INTO users (full_name, email, phone, password_hash, age, preferred_language)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email.toLowerCase(), phone || null, password_hash, age || null, preferred_language || 'en']
    );

    const user = {
      id: result.lastID,
      full_name,
      email: email.toLowerCase(),
      phone: phone || null,
      age: age || null,
      preferred_language: preferred_language || 'en'
    };

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Failed to create account' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        preferred_language: user.preferred_language
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me — Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, full_name, email, phone, age, preferred_language, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile — Update profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, phone, age, preferred_language } = req.body;
    await dbRun(
      `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone),
       age = COALESCE(?, age), preferred_language = COALESCE(?, preferred_language),
       updated_at = datetime('now') WHERE id = ?`,
      [full_name, phone, age, preferred_language, req.user.id]
    );
    const user = await dbGet(
      'SELECT id, full_name, email, phone, age, preferred_language FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   MEDICINE ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/medicines
app.get('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const medicines = await dbAll(
      'SELECT * FROM medicines WHERE user_id = ? AND is_active = 1 ORDER BY name ASC',
      [req.user.id]
    );
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch medicines' });
  }
});

// GET /api/medicines/:id
app.get('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const med = await dbGet(
      'SELECT * FROM medicines WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch medicine' });
  }
});

// POST /api/medicines
app.post('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const {
      name, dosage, type, frequency, times_per_day,
      time_slots, instructions, stock_count,
      refill_threshold, pill_shape, pill_color,
      start_date, end_date
    } = req.body;

    if (!name || !dosage) {
      return res.status(400).json({ message: 'Name and dosage are required' });
    }

    const result = await dbRun(
      `INSERT INTO medicines 
       (user_id, name, dosage, type, frequency, times_per_day, time_slots, instructions,
        stock_count, refill_threshold, pill_shape, pill_color, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, name, dosage,
        type || 'tablet', frequency || 'daily', times_per_day || 1,
        JSON.stringify(time_slots || ['08:00']), instructions || 'after meal',
        stock_count || 30, refill_threshold || 7,
        pill_shape || 'round', pill_color || '#3b82f6',
        start_date || new Date().toISOString().split('T')[0],
        end_date || null
      ]
    );

    // Automatically generate today's schedule entries
    const slots = time_slots || ['08:00'];
    const today = new Date().toISOString().split('T')[0];
    for (const slot of slots) {
      await dbRun(
        `INSERT OR IGNORE INTO schedules (user_id, medicine_id, scheduled_date, scheduled_time)
         VALUES (?, ?, ?, ?)`,
        [req.user.id, result.lastID, today, slot]
      ).catch(() => {}); // ignore duplicates
    }

    // Check stock and create alert if low
    if ((stock_count || 30) <= (refill_threshold || 7)) {
      await dbRun(
        `INSERT INTO alerts (user_id, type, severity, title, message, related_id)
         VALUES (?, 'low_stock', 'warning', ?, ?, ?)`,
        [req.user.id, `Low stock: ${name}`, `Only ${stock_count} doses remaining. Consider refilling.`, result.lastID]
      );
    }

    const med = await dbGet('SELECT * FROM medicines WHERE id = ?', [result.lastID]);
    res.status(201).json(med);
  } catch (err) {
    console.error('Add medicine error:', err);
    res.status(500).json({ message: 'Failed to add medicine' });
  }
});

// PUT /api/medicines/:id
app.put('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await dbGet(
      'SELECT * FROM medicines WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ message: 'Medicine not found' });

    const {
      name, dosage, type, frequency, times_per_day,
      time_slots, instructions, stock_count,
      refill_threshold, pill_shape, pill_color,
      is_active, start_date, end_date
    } = req.body;

    await dbRun(
      `UPDATE medicines SET
        name = COALESCE(?, name), dosage = COALESCE(?, dosage),
        type = COALESCE(?, type), frequency = COALESCE(?, frequency),
        times_per_day = COALESCE(?, times_per_day),
        time_slots = COALESCE(?, time_slots),
        instructions = COALESCE(?, instructions),
        stock_count = COALESCE(?, stock_count),
        refill_threshold = COALESCE(?, refill_threshold),
        pill_shape = COALESCE(?, pill_shape),
        pill_color = COALESCE(?, pill_color),
        is_active = COALESCE(?, is_active),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?`,
      [
        name, dosage, type, frequency, times_per_day,
        time_slots ? JSON.stringify(time_slots) : null,
        instructions, stock_count, refill_threshold,
        pill_shape, pill_color, is_active,
        start_date, end_date,
        req.params.id, req.user.id
      ]
    );

    const updated = await dbGet('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update medicine' });
  }
});

// DELETE /api/medicines/:id (soft delete)
app.delete('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const result = await dbRun(
      `UPDATE medicines SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove medicine' });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   SCHEDULE ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/schedules?date=YYYY-MM-DD
app.get('/api/schedules', authenticateToken, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const schedules = await dbAll(
      `SELECT s.*, m.name as medicine_name, m.dosage, m.type, m.pill_shape, m.pill_color, m.instructions
       FROM schedules s
       JOIN medicines m ON s.medicine_id = m.id
       WHERE s.user_id = ? AND s.scheduled_date = ? AND m.is_active = 1
       ORDER BY s.scheduled_time ASC`,
      [req.user.id, date]
    );
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
});

// POST /api/schedules/generate — Generate schedules for a date
app.post('/api/schedules/generate', authenticateToken, async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().split('T')[0];
    const medicines = await dbAll(
      `SELECT * FROM medicines WHERE user_id = ? AND is_active = 1
       AND start_date <= ? AND (end_date IS NULL OR end_date >= ?)`,
      [req.user.id, date, date]
    );

    let generated = 0;
    for (const med of medicines) {
      const slots = JSON.parse(med.time_slots || '["08:00"]');
      for (const slot of slots) {
        const result = await dbRun(
          `INSERT OR IGNORE INTO schedules (user_id, medicine_id, scheduled_date, scheduled_time)
           VALUES (?, ?, ?, ?)`,
          [req.user.id, med.id, date, slot]
        );
        if (result.lastID) generated++;
      }
    }

    res.json({ message: `Generated ${generated} schedule entries for ${date}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate schedules' });
  }
});

// PUT /api/schedules/:id/take — Mark a dose as taken
app.put('/api/schedules/:id/take', authenticateToken, async (req, res) => {
  try {
    const result = await dbRun(
      `UPDATE schedules SET status = 'taken', taken_at = datetime('now') WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'Schedule not found' });

    // Decrement stock
    const schedule = await dbGet('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
    if (schedule) {
      await dbRun(
        `UPDATE medicines SET stock_count = MAX(0, stock_count - 1), updated_at = datetime('now')
         WHERE id = ?`,
        [schedule.medicine_id]
      );

      // Check if stock is now low
      const med = await dbGet('SELECT * FROM medicines WHERE id = ?', [schedule.medicine_id]);
      if (med && med.stock_count <= med.refill_threshold) {
        await dbRun(
          `INSERT INTO alerts (user_id, type, severity, title, message, related_id)
           VALUES (?, 'low_stock', 'warning', ?, ?, ?)`,
          [req.user.id, `Refill needed: ${med.name}`, `Only ${med.stock_count} doses left.`, med.id]
        );
      }
    }

    // Update daily adherence
    await updateDailyAdherence(req.user.id, schedule?.scheduled_date);

    res.json({ message: 'Dose marked as taken' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark dose' });
  }
});

// PUT /api/schedules/:id/skip
app.put('/api/schedules/:id/skip', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await dbRun(
      `UPDATE schedules SET status = 'skipped', skipped_reason = ? WHERE id = ? AND user_id = ?`,
      [reason || null, req.params.id, req.user.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'Schedule not found' });

    const schedule = await dbGet('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
    await updateDailyAdherence(req.user.id, schedule?.scheduled_date);

    res.json({ message: 'Dose skipped' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to skip dose' });
  }
});

// Helper: update daily adherence summary
async function updateDailyAdherence(userId, date) {
  if (!date) date = new Date().toISOString().split('T')[0];
  const stats = await dbGet(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END) as taken,
       SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed
     FROM schedules WHERE user_id = ? AND scheduled_date = ?`,
    [userId, date]
  );

  const score = stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0;
  await dbRun(
    `INSERT OR REPLACE INTO adherence_daily (user_id, date, total_doses, taken_doses, missed_doses, score)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, date, stats.total, stats.taken, stats.missed, score]
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VITALS ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/vitals?type=bp&limit=30
app.get('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const { type, limit } = req.query;
    let sql = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [req.user.id];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY recorded_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const vitals = await dbAll(sql, params);
    res.json(vitals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vitals' });
  }
});

// GET /api/vitals/latest — Get latest reading for each type
app.get('/api/vitals/latest', authenticateToken, async (req, res) => {
  try {
    const vitals = await dbAll(
      `SELECT v.* FROM vitals v
       INNER JOIN (
         SELECT type, MAX(recorded_at) as max_date
         FROM vitals WHERE user_id = ? GROUP BY type
       ) latest ON v.type = latest.type AND v.recorded_at = latest.max_date
       WHERE v.user_id = ?`,
      [req.user.id, req.user.id]
    );

    // Transform to a friendly object
    const result = {};
    for (const v of vitals) {
      result[v.type] = {
        value: v.value,
        value2: v.value2,
        unit: v.unit,
        recorded_at: v.recorded_at,
        notes: v.notes
      };
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch latest vitals' });
  }
});

// POST /api/vitals
app.post('/api/vitals', authenticateToken, async (req, res) => {
  try {
    const { type, value, value2, unit, notes, recorded_at } = req.body;
    if (!type || value === undefined || !unit) {
      return res.status(400).json({ message: 'Type, value, and unit are required' });
    }

    const validTypes = ['bp', 'sugar', 'pulse', 'weight', 'temperature', 'spo2'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `Type must be one of: ${validTypes.join(', ')}` });
    }

    const result = await dbRun(
      `INSERT INTO vitals (user_id, type, value, value2, unit, notes, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, value, value2 || null, unit, notes || null, recorded_at || new Date().toISOString()]
    );

    // Generate smart alerts based on vitals
    await generateVitalAlerts(req.user.id, type, value, value2);

    const vital = await dbGet('SELECT * FROM vitals WHERE id = ?', [result.lastID]);
    res.status(201).json(vital);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record vitals' });
  }
});

// Helper: generate alerts based on vitals
async function generateVitalAlerts(userId, type, value, value2) {
  let alert = null;

  if (type === 'bp') {
    const systolic = value;
    const diastolic = value2 || 80;
    if (systolic >= 140 || diastolic >= 90) {
      alert = { severity: 'high', title: '⚠ High Blood Pressure', message: `Reading of ${systolic}/${diastolic} mmHg is elevated. Monitor closely.` };
    } else if (systolic <= 90 || diastolic <= 60) {
      alert = { severity: 'high', title: '⚠ Low Blood Pressure', message: `Reading of ${systolic}/${diastolic} mmHg is low. Stay hydrated and rest.` };
    }
  } else if (type === 'sugar') {
    if (value >= 200) {
      alert = { severity: 'high', title: '⚠ High Blood Sugar', message: `Glucose at ${value} mg/dL is very high. Check with your doctor.` };
    } else if (value <= 70) {
      alert = { severity: 'high', title: '⚠ Low Blood Sugar', message: `Glucose at ${value} mg/dL is low. Eat something sweet immediately.` };
    }
  } else if (type === 'pulse') {
    if (value >= 100) {
      alert = { severity: 'medium', title: '⚡ Elevated Heart Rate', message: `Pulse at ${value} bpm is higher than normal.` };
    } else if (value <= 50) {
      alert = { severity: 'medium', title: '⚡ Low Heart Rate', message: `Pulse at ${value} bpm is below normal range.` };
    }
  }

  if (alert) {
    await dbRun(
      `INSERT INTO alerts (user_id, type, severity, title, message)
       VALUES (?, 'vital_alert', ?, ?, ?)`,
      [userId, alert.severity, alert.title, alert.message]
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ALERTS ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const { unread_only, limit } = req.query;
    let sql = 'SELECT * FROM alerts WHERE user_id = ?';
    const params = [req.user.id];

    if (unread_only === 'true') {
      sql += ' AND is_read = 0';
    }

    sql += ' ORDER BY created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const alerts = await dbAll(sql, params);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

// GET /api/alerts/missed — Get today's missed doses
app.get('/api/alerts/missed', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);

    // Find pending doses where time has passed
    const missed = await dbAll(
      `SELECT s.*, m.name as medicine_name, m.dosage, m.pill_color
       FROM schedules s
       JOIN medicines m ON s.medicine_id = m.id
       WHERE s.user_id = ? AND s.scheduled_date = ? AND s.status = 'pending'
       AND s.scheduled_time < ?
       ORDER BY s.scheduled_time ASC`,
      [req.user.id, today, now]
    );

    // Auto-mark as missed
    for (const m of missed) {
      await dbRun(
        "UPDATE schedules SET status = 'missed' WHERE id = ?",
        [m.id]
      );
    }

    if (missed.length > 0) {
      await updateDailyAdherence(req.user.id, today);
    }

    res.json(missed.map(m => ({
      id: m.id,
      medicine: m.medicine_name,
      dosage: m.dosage,
      time: m.scheduled_time,
      status: 'missed',
      severity: 'high'
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to check missed doses' });
  }
});

// PUT /api/alerts/:id/read
app.put('/api/alerts/:id/read', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE alerts SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Alert marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update alert' });
  }
});

// PUT /api/alerts/read-all
app.put('/api/alerts/read-all', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE alerts SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.user.id]);
    res.json({ message: 'All alerts marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update alerts' });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   ADHERENCE / ANALYTICS ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// GET /api/adherence/score — Get adherence score for a period
app.get('/api/adherence/score', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = await dbGet(
      `SELECT 
         COALESCE(AVG(score), 0) as average_score,
         COALESCE(SUM(total_doses), 0) as total_doses,
         COALESCE(SUM(taken_doses), 0) as taken_doses,
         COALESCE(SUM(missed_doses), 0) as missed_doses,
         COUNT(*) as days_tracked
       FROM adherence_daily
       WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')`,
      [req.user.id, days]
    );
    res.json({
      score: Math.round(stats.average_score || 0),
      ...stats
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch adherence' });
  }
});

// GET /api/adherence/history — Daily adherence breakdown
app.get('/api/adherence/history', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await dbAll(
      `SELECT * FROM adherence_daily
       WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
       ORDER BY date ASC`,
      [req.user.id, days]
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch adherence history' });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   AI CHAT ROUTES
   ═══════════════════════════════════════════════════════════════════════════ */

// POST /api/ai/chat
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { message, language, vitals, history } = req.body;
    
    // Save user message
    await dbRun(
      `INSERT INTO chat_messages (user_id, role, content, language) VALUES (?, 'user', ?, ?)`,
      [req.user.id, message, language || 'en']
    );

    // Get user's medicines for context
    const medicines = await dbAll(
      'SELECT name, dosage, frequency FROM medicines WHERE user_id = ? AND is_active = 1',
      [req.user.id]
    );
    const medList = medicines.map(m => `${m.name} (${m.dosage})`).join(', ');

    // Get today's adherence
    const today = new Date().toISOString().split('T')[0];
    const adherence = await dbGet(
      'SELECT * FROM adherence_daily WHERE user_id = ? AND date = ?',
      [req.user.id, today]
    );

    // --- GEMINI INTEGRATION ---
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const contextPrompt = `
You are the AyuGuard AI Medical Companion for Indian elderly care.
The user is ${req.user.full_name}, age ${req.user.age || 'unknown'}. They prefer to speak ${language === 'te' ? 'Telugu' : 'English'}.

CURRENT OBSERVATIONS:
- Vitals: ${JSON.stringify(vitals || {})}
- Adherence Score Today: ${adherence ? adherence.score + '%' : 'No data yet'}
- Active Medicines: ${medList || 'None'}

RULES:
1. Respond directly to the user's message.
2. If medical advice is discussed, prominently state a disclaimer (e.g., "> ⚠️ Always consult your doctor").
3. Use clear Markdown (bold headers, short bullet points).
4. Be empathetic, kind, and concise. Avoid hallucinating medical facts.
5. You MUST respond entirely in ${language === 'te' ? 'Telugu language' : 'English language'}.
    `;

    // Construct history for Gemini
    const chatHistory = [
      { role: "user", parts: [{ text: contextPrompt }] },
      { role: "model", parts: [{ text: `Understood. I will respond to the user exclusively in ${language === 'te' ? 'Telugu' : 'English'}.` }] }
    ];

    if (history && history.length > 0) {
      for (const msg of history) {
        chatHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Save AI response
    await dbRun(
      `INSERT INTO chat_messages (user_id, role, content, language) VALUES (?, 'assistant', ?, ?)`,
      [req.user.id, reply, language || 'en']
    );

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Chat failed' });
  }
});

// GET /api/ai/history — Get chat history
app.get('/api/ai/history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = await dbAll(
      `SELECT role, content, language, created_at FROM chat_messages
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [req.user.id, limit]
    );
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   HEALTH CHECK
   ═══════════════════════════════════════════════════════════════════════════ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

/* ═══════════════════════════════════════════════════════════════════════════
   START SERVER
   ═══════════════════════════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n🚀 AyuGuard AI Server v2.0`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Database: ${dbPath}\n`);
});
