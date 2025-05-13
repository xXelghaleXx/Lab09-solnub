const express = require('express');
const app = express();
const productsRoutes = require('./routes/products');
require('dotenv').config();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use('/api/productos', productsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const webRoutes = require('./routes/web');
app.use('/', webRoutes);
