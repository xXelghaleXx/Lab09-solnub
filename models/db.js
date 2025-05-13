const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./products.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL,
      imagen_url TEXT
    )
  `);
});

module.exports = db;
