const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/productController');

// Guardar archivos temporalmente en /tmp
const upload = multer({ dest: 'tmp/' });

router.get('/', productController.getAllProducts);
router.post('/', upload.single('imagen'), productController.createProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
