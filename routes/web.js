const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const { uploadFileToS3, deleteFileFromS3 } = require('../s3');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mostrar productos
router.get('/', (req, res) => {
  db.all('SELECT * FROM productos', (err, productos) => {
    if (err) return res.status(500).send("Error al consultar productos");
    res.render('index', { productos });
  });
});

// Mostrar formulario
router.get('/productos/new', (req, res) => {
  res.render('new');
});

// Crear producto
router.post('/productos', upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const file = req.file;

  const s3Result = await uploadFileToS3(file);

  db.run(
    `INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?)`,
    [nombre, descripcion, precio, s3Result.Location],
    (err) => {
      if (err) return res.status(500).send("Error al guardar producto");
      res.redirect('/');
    }
  );
});

// Eliminar producto
router.post('/productos/:id/delete', (req, res) => {
  const id = req.params.id;

  db.get('SELECT imagen_url FROM productos WHERE id = ?', [id], async (err, row) => {
    if (err || !row) return res.redirect('/');
    
    const imageUrl = row.imagen_url;
    const filename = imageUrl.split('/').pop();

    await deleteFileFromS3(filename);

    db.run('DELETE FROM productos WHERE id = ?', [id], () => {
      res.redirect('/');
    });
  });
});

module.exports = router;
