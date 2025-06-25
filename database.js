const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
let dbInstance = null;

async function getDB() {
    if (dbInstance) return dbInstance;
    
    try {
        dbInstance = await open({
            filename: './tasks.db',
            driver: sqlite3.Database
        });

        await dbInstance.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL
            )
        `);

        return dbInstance;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
}

module.exports = { getDB };
