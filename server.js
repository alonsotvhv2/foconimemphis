const express = require('express');
const { getDB } = require('./database');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.')); // Sirve archivos estáticos (index.html, app.js, style.css)

app.get('/api/check-db', async (req, res) => {
    try {
        const db = await getDB();
        await db.get('SELECT name FROM sqlite_master WHERE type="table" AND name="tasks"');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const db = await getDB();
        const tasks = await db.all('SELECT * FROM tasks');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tasks/:id', async (req, res) => {
    try {
        const db = await getDB();
        const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: 'Tarea no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'La tarea es requerida' });
    try {
        const db = await getDB();
        const result = await db.run('INSERT INTO tasks (task) VALUES (?)', [task]);
        res.status(201).json({ id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'La tarea es requerida' });
    try {
        const db = await getDB();
        const result = await db.run('UPDATE tasks SET task = ? WHERE id = ?', [task, req.params.id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
