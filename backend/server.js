require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Sitio = require('./models/Sitio');
const Reserva = require('./models/Reserva');
const { verificarToken } = require('./middleware/auth');
const verificarAdmin = require('./middleware/admin');

const authRoutes = require('./routes/auth');
const turisRoutes = require('./routes/turisplay');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/turisplay', turisRoutes);

// ==========================================
// RUTAS DE SITIOS TURÍSTICOS
// ==========================================

// Obtener todos los sitios (Pública)
app.get('/api/sitios', async (req, res) => {
  try {
    const sitios = await Sitio.find();
    res.json(sitios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Crear un sitio turístico (Protegida: Solo Admin)
app.post('/api/sitios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevoSitio = await Sitio.create(req.body);
    res.status(201).json(nuevoSitio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un sitio turístico por ID (Protegida: Solo Admin)
app.delete('/api/sitios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sitioEliminado = await Sitio.findByIdAndDelete(id);

    if (!sitioEliminado) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado para eliminar' });
    }

    res.status(200).json({
      mensaje: 'Sitio turístico eliminado exitosamente',
      sitioEliminado
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al eliminar el sitio turístico', 
      detalles: error.message 
    });
  }
});

// ==========================================
// RUTAS DE RESERVAS
// ==========================================

// Consultar todas las reservas (Protegida)
app.get('/api/reservas', verificarToken, async (req, res) => {
  try {
    const reservas = await Reserva.find();
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar reservas' });
  }
});

// Crear una reserva (Protegida)
app.post('/api/reservas', verificarToken, async (req, res) => {
  try {
    const nuevaReserva = await Reserva.create(req.body);
    res.status(201).json(nuevaReserva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta de prueba general
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor TurisPlaY Backend en línea 🚀' });
});

// ==========================================
// CONEXIÓN A MONGODB ATLAS Y PUERTO
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error de conexión:', err));