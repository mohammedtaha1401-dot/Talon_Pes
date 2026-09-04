const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// ADMIN LOGIN
// =========================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Taha92mm";

// =========================
// DATABASE
// =========================

const db = new Database("talon.db");

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  date TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS standings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team TEXT NOT NULL,
  played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS honors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  option1 TEXT NOT NULL,
  option2 TEXT NOT NULL,
  option3 TEXT NOT NULL,
  votes1 INTEGER DEFAULT 0,
  votes2 INTEGER DEFAULT 0,
  votes3 INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);
`);

// =========================
// HONORS SEED DATA
// =========================

const honorsCount = db
  .prepare("SELECT COUNT(*) AS count FROM honors")
  .get().count;

if (honorsCount === 0) {
  const honors = [
    ["53 - SeAsOn", 106],
    ["رویس وفادار", 106],
    ["مارال", 75],
    ["ماتیاس", 55],
    ["رافی", 54],
    ["لوک", 45],
    ["تئو", 38],
    ["زلاتان", 33],
    ["امین اودین", 30],
    ["دارک کینگ", 27],
    ["دنی والورده", 24],
    ["مهدی تئو", 22],
    ["مجی", 20],
    ["لوکاس", 20],
    ["مارکوس", 20],
    ["محسن", 18],
    ["اسلیوکا", 17],
    ["امیر دیبروین", 16],
    ["سام فودن", 16],
    ["امیر بلینگهام", 13],
    ["کینگ مستر", 12],
    ["طاها تالون", 11],
    ["تریکانو", 11],
    ["طاها", 10],
    ["طاها اس ای اس", 10],
    ["امیر اگوئرو(خولیان)", 9],
    ["ساواک", 8],
    ["یونس", 8],
    ["گاردین", 8],
    ["امیر ولیکس", 8],
    ["فرساد", 7],
    ["جیمی", 7],
    ["مجنون", 6],
    ["ایلیا", 6],
    ["تیلمانس", 6],
    ["شیخ", 5],
    ["فینیکس", 5],
    ["مودریک", 5],
    ["بنی", 5],
    ["ریرسون", 5],
    ["تورک(تاکاز)", 5],
    ["عرفان فلادیوس", 5],
    ["مهدی زد ایکس", 4],
    ["ژنرال", 4],
    ["فرهان", 3],
    ["مانی", 3],
    ["طاها بیگ", 3],
    ["کارلتو پرز", 3],
    ["ژاکروک", 3],
    ["سیانور", 3],
    ["هاورتز", 3],
    ["ممد رضا", 3],
    ["ممفیس", 2],
    ["لوکاس", 2],
    ["ممد جونیور", 1],
    ["امیر دیبالا", 1],
    ["فانتوم", 1],
    ["ییلدیز", 1],
    ["ماهان گواردیولا", 1],
    ["تایان(بائنا)", 1]
  ];

  const insertHonor = db.prepare(
    "INSERT INTO honors (name, points) VALUES (?, ?)"
  );

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insertHonor.run(item[0], item[1]);
    }
  });

  insertMany(honors);
}

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "talon-session-secret-2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({
      error: "دسترسی غیرمجاز"
    });
  }

  next();
}

// =========================
// LOGIN
// =========================

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {
    req.session.admin = true;

    return res.json({
      success: true
    });
  }

  res.status(401).json({
    success: false,
    error: "نام کاربری یا رمز عبور اشتباه است"
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      success: true
    });
  });
});

app.get("/api/me", (req, res) => {
  res.json({
    loggedIn: !!req.session.admin
  });
});

// =========================
// NEWS
// =========================

app.get("/api/news", (req, res) => {
  const data = db
    .prepare("SELECT * FROM news ORDER BY id DESC")
    .all();

  res.json(data);
});

app.post("/api/news", requireAdmin, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      error: "عنوان و متن خبر الزامی است"
    });
  }

  const result = db
    .prepare(
      "INSERT INTO news (title, content) VALUES (?, ?)"
    )
    .run(title, content);

  res.json({
    success: true,
    id: result.lastInsertRowid
  });
});

app.put("/api/news/:id", requireAdmin, (req, res) => {
  const { title, content } = req.body;

  db.prepare(`
    UPDATE news
    SET title = ?, content = ?
    WHERE id = ?
  `).run(title, content, req.params.id);

  res.json({ success: true });
});

app.delete("/api/news/:id", requireAdmin, (req, res) => {
  db.prepare(
    "DELETE FROM news WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

// =========================
// GAMES
// =========================

app.get("/api/games", (req, res) => {
  const data = db
    .prepare("SELECT * FROM games ORDER BY id DESC")
    .all();

  res.json(data);
});

app.post("/api/games", requireAdmin, (req, res) => {
  const {
    home_team,
    away_team,
    home_score,
    away_score,
    date
  } = req.body;

  if (!home_team || !away_team) {
    return res.status(400).json({
      error: "نام دو تیم الزامی است"
    });
  }

  const result = db.prepare(`
    INSERT INTO games
    (home_team, away_team, home_score, away_score, date)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    home_team,
    away_team,
    Number(home_score) || 0,
    Number(away_score) || 0,
    date || ""
  );

  res.json({
    success: true,
    id: result.lastInsertRowid
  });
});

app.put("/api/games/:id", requireAdmin, (req, res) => {
  const {
    home_team,
    away_team,
    home_score,
    away_score,
    date
  } = req.body;

  db.prepare(`
    UPDATE games
    SET home_team = ?,
        away_team = ?,
        home_score = ?,
        away_score = ?,
        date = ?
    WHERE id = ?
  `).run(
    home_team,
    away_team,
    Number(home_score) || 0,
    Number(away_score) || 0,
    date || "",
    req.params.id
  );

  res.json({ success: true });
});

app.delete("/api/games/:id", requireAdmin, (req, res) => {
  db.prepare(
    "DELETE FROM games WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

// =========================
// STANDINGS
// =========================

app.get("/api/standings", (req, res) => {
  const data = db
    .prepare(`
      SELECT * FROM standings
      ORDER BY points DESC, wins DESC, team ASC
    `)
    .all();

  res.json(data);
});

app.post("/api/standings", requireAdmin, (req, res) => {
  const {
    team,
    played,
    wins,
    draws,
    losses,
    points
  } = req.body;

  if (!team) {
    return res.status(400).json({
      error: "نام تیم الزامی است"
    });
  }

  const result = db.prepare(`
    INSERT INTO standings
    (team, played, wins, draws, losses, points)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    team,
    Number(played) || 0,
    Number(wins) || 0,
    Number(draws) || 0,
    Number(losses) || 0,
    Number(points) || 0
  );

  res.json({
    success: true,
    id: result.lastInsertRowid
  });
});

app.put("/api/standings/:id", requireAdmin, (req, res) => {
  const {
    team,
    played,
    wins,
    draws,
    losses,
    points
  } = req.body;

  db.prepare(`
    UPDATE standings
    SET team = ?,
        played = ?,
        wins = ?,
        draws = ?,
        losses = ?,
        points = ?
    WHERE id = ?
  `).run(
    team,
    Number(played) || 0,
    Number(wins) || 0,
    Number(draws) || 0,
    Number(losses) || 0,
    Number(points) || 0,
    req.params.id
  );

  res.json({ success: true });
});

app.delete("/api/standings/:id", requireAdmin, (req, res) => {
  db.prepare(
    "DELETE FROM standings WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

// =========================
// HONORS
// =========================

app.get("/api/honors", (req, res) => {
  const data = db
    .prepare(`
      SELECT * FROM honors
      ORDER BY points DESC, name ASC
    `)
    .all();

  res.json(data);
});

app.post("/api/honors", requireAdmin, (req, res) => {
  const { name, points } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "نام الزامی است"
    });
  }

  const result = db
    .prepare(
      "INSERT INTO honors (name, points) VALUES (?, ?)"
    )
    .run(name, Number(points) || 0);

  res.json({
    success: true,
    id: result.lastInsertRowid
  });
});

app.put("/api/honors/:id", requireAdmin, (req, res) => {
  const { name, points } = req.body;

  db.prepare(`
    UPDATE honors
    SET name = ?, points = ?
    WHERE id = ?
  `).run(
    name,
    Number(points) || 0,
    req.params.id
  );

  res.json({ success: true });
});

app.delete("/api/honors/:id", requireAdmin, (req, res) => {
  db.prepare(
    "DELETE FROM honors WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

// =========================
// CHAT
// =========================

app.get("/api/chat", (req, res) => {
  const messages = db
    .prepare(`
      SELECT * FROM chat
      ORDER BY id DESC
      LIMIT 100
    `)
    .all()
    .reverse();

  res.json(messages);
});

app.post("/api/chat", (req, res) => {
  const { username, message } = req.body;

  if (!username || !message) {
    return res.status(400).json({
      error: "نام و پیام الزامی است"
    });
  }

  db.prepare(`
    INSERT INTO chat (username, message)
    VALUES (?, ?)
  `).run(
    username.trim().slice(0, 30),
    message.trim().slice(0, 500)
  );

  res.json({
    success: true
  });
});

app.delete("/api/chat/:id", requireAdmin, (req, res) => {
  db.prepare(
    "DELETE FROM chat WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

// =========================
// POLL
// =========================

app.get("/api/poll", (req, res) => {
  const poll = db
    .prepare(`
      SELECT * FROM polls
      WHERE active = 1
      ORDER BY id DESC
      LIMIT 1
    `)
    .get();

  res.json(poll || null);
});

app.post("/api/poll/vote", (req, res) => {
  const { pollId, option } = req.body;

  if (!pollId || !["1", "2", "3"].includes(String(option))) {
    return res.status(400).json({
      error: "گزینه نامعتبر است"
    });
  }

  const column = `votes${option}`;

  db.prepare(`
    UPDATE polls
    SET ${column} = ${column} + 1
    WHERE id = ?
  `).run(pollId);

  res.json({
    success: true
  });
});

app.post("/api/poll", requireAdmin, (req, res) => {
  const {
    question,
    option1,
    option2,
    option3
  } = req.body;

  if (!question || !option1 || !option2 || !option3) {
    return res.status(400).json({
      error: "سؤال و سه گزینه الزامی هستند"
    });
  }

  db.prepare(
    "UPDATE polls SET active = 0"
  ).run();

  const result = db.prepare(`
    INSERT INTO polls
    (question, option1, option2, option3, active)
    VALUES (?, ?, ?, ?, 1)
  `).run(
    question,
    option1,
    option2,
    option3
  );

  res.json({
    success: true,
    id: result.lastInsertRowid
  });
});

app.delete("/api/poll/:id", requireAdmin, (req, res) => {
  db.prepare(
    "DELETE FROM polls WHERE id = ?"
  ).run(req.params.id);

  res.json({ success: true });
});

// =========================
// STATIC WEBSITE
// =========================

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

app.get("*", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});

// =========================
// START
// =========================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `TALON League running on port ${PORT}`
  );
});
