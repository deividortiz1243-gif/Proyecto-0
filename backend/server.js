require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importación de modelos
const Lugar = require('./models/reservas');

// Importación de rutas
const authRoutes = require('./routes/auth');
const turisRoutes = require('./routes/turisplay');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint para consultar datos desde MongoDB Atlas (Sesión 12)
app.get('/api/productos', async (req, res) => {
  try {
    const lugares = await Lugar.find();
    res.json(lugares);
  } catch (error) {
    console.error('❌ Error de MongoDB:', error); // Muestra el detalle del error en la terminal
    res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
  }
});

// Rutas de TurisPlaY
app.use('/api/auth', authRoutes);
app.use('/api/turisplay', turisRoutes);

// Conexión a MongoDB Atlas y arranque del servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err);
    // Permite iniciar el servidor en desarrollo aunque no responda la base de datos de inmediato
    app.listen(PORT, () => console.log(`⚠️ Servidor en puerto ${PORT} (sin conexión DB)`));
  });