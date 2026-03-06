import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("app.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    createdAt INTEGER,
    dueDate TEXT,
    alarmTime TEXT,
    priority TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    createdAt INTEGER,
    color TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/todos", (req, res) => {
    const todos = db.prepare("SELECT * FROM todos ORDER BY createdAt DESC").all();
    res.json(todos.map((t: any) => ({ ...t, completed: !!t.completed })));
  });

  app.post("/api/todos", (req, res) => {
    const { id, title, description, completed, createdAt, dueDate, alarmTime, priority, category } = req.body;
    db.prepare(`
      INSERT INTO todos (id, title, description, completed, createdAt, dueDate, alarmTime, priority, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        description=excluded.description,
        completed=excluded.completed,
        dueDate=excluded.dueDate,
        alarmTime=excluded.alarmTime,
        priority=excluded.priority,
        category=excluded.category
    `).run(id, title, description, completed ? 1 : 0, createdAt, dueDate, alarmTime, priority, category);
    res.json({ success: true });
  });

  app.delete("/api/todos/:id", (req, res) => {
    db.prepare("DELETE FROM todos WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/notes", (req, res) => {
    const notes = db.prepare("SELECT * FROM notes ORDER BY createdAt DESC").all();
    res.json(notes);
  });

  app.post("/api/notes", (req, res) => {
    const { id, title, content, createdAt, color } = req.body;
    db.prepare(`
      INSERT INTO notes (id, title, content, createdAt, color)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        content=excluded.content,
        color=excluded.color
    `).run(id, title, content, createdAt, color);
    res.json({ success: true });
  });

  app.delete("/api/notes/:id", (req, res) => {
    db.prepare("DELETE FROM notes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
