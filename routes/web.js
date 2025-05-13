const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const { uploadFileToS3, deleteFileFromS3 } = require('../s3');

// Usamos almacenamiento en memoria (no se guarda en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mostrar todos los productos
router.get('/', (req, res) => {
  db.all('SELECT * FROM productos', (err, productos) => {
    if (err) return res.status(500).send("Error al consultar productos");
    res.render('index', { productos });
  });
});

// Formulario de nuevo producto
router.get('/productos/new', (req, res) => {
  res.render('new');
});

// Crear un nuevo producto
router.post('/productos', upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, precio } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("Imagen no proporcionada");
  }

  try {
    const s3Result = await uploadFileToS3(file); // file.buffer incluido
    const imageUrl = s3Result.Location;

    db.run(
      `INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES (?, ?, ?, ?)`,
      [nombre, descripcion, precio, imageUrl],
      (err) => {
        if (err) return res.status(500).send("Error al guardar producto");
        res.redirect('/');
      }
    );
  } catch (error) {
    console.error("Error al subir a S3:", error);
    res.status(500).send("Error al subir la imagen");
  }
});

// Eliminar producto
router.post('/productos/:id/delete', (req, res) => {
  const id = req.params.id;

  db.get('SELECT imagen_url FROM productos WHERE id = ?', [id], async (err, row) => {
    if (err || !row) return res.redirect('/');

    const imageUrl = row.imagen_url;
    const filename = imageUrl.split('/').pop(); // Extraer nombre de archivo de la URL

    try {
      await deleteFileFromS3(filename);
    } catch (error) {
      console.error("Error al eliminar archivo de S3:", error);
    }

    db.run('DELETE FROM productos WHERE id = ?', [id], () => {
      res.redirect('/');
    });
  });
});

module.exports = router;
