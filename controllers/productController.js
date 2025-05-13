const db = require('../models/db');
const { uploadToS3, deleteFromS3 } = require('../services/s3Service');

async function createProduct(req, res) {
  const { nombre, descripcion, precio } = req.body;

  if (!req.file) return res.status(400).send('Imagen requerida');

  try {
    const upload = await uploadToS3(req.file);
    const imageUrl = upload.Location;

    db.run(
      `INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?)`,
      [nombre, descripcion, precio, imageUrl],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, nombre, descripcion, precio, imagen_url: imageUrl });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getAllProducts(req, res) {
  db.all(`SELECT * FROM productos`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

function deleteProduct(req, res) {
  const id = req.params.id;
  db.get(`SELECT imagen_url FROM productos WHERE id = ?`, [id], async (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Producto no encontrado' });

    const key = row.imagen_url.split('/').pop();
    try {
      await deleteFromS3(key);
      db.run(`DELETE FROM productos WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto eliminado' });
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

module.exports = {
  createProduct,
  getAllProducts,
  deleteProduct
};
