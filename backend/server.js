require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importación de modelos
const Sitio = require('./models/Sitio');
const Reserva = require('./models/Reserva');

// Importación de middlewares de autenticación y roles
const { verificarToken } = require('./middleware/auth');
const verificarAdmin = require('./middleware/admin'); // ← AGREGADO S15

// Importación de rutas
const authRoutes = require('./routes/auth');
const turisRoutes = require('./routes/turisplay');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS AUTENTICACIÓN Y OTRAS
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/turisplay', turisRoutes);

// ==========================================
// RUTAS CRUD PARA SITIOS TURÍSTICOS
// ==========================================

// 1. GET: Obtener todos los sitios turísticos (PÚBLICA)
app.get('/api/sitios', async (req, res) => {
  try {
    const sitios = await Sitio.find();
    res.json(sitios);
  } catch (error) {
    console.error('❌ Error al obtener sitios:', error);
    res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
  }
});

// 2. POST: Crear un nuevo sitio turístico (SOLO ADMIN)
app.post('/api/sitios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevoSitio = await Sitio.create(req.body);
    res.status(201).json(nuevoSitio);
  } catch (error) {
    console.error('❌ Error al crear sitio:', error);
    res.status(400).json({ error: error.message });
  }
});

// 3. PUT: Actualizar un sitio existente por su _id (SOLO ADMIN)
app.put('/api/sitios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const sitioActualizado = await Sitio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );
    if (!sitioActualizado) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado' });
    }
    res.json(sitioActualizado);
  } catch (error) {
    console.error('❌ Error al actualizar sitio:', error);
    res.status(400).json({ error: error.message });
  }
});

// 4. DELETE: Eliminar un sitio por su _id (SOLO ADMIN)
app.delete('/api/sitios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const sitioEliminado = await Sitio.findByIdAndDelete(req.params.id);
    if (!sitioEliminado) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado' });
    }
    res.json({ mensaje: 'Sitio eliminado correctamente de TurisPlaY', sitioEliminado });
  } catch (error) {
    console.error('❌ Error al eliminar sitio:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// RUTAS CRUD PARA RESERVAS
// ==========================================

// 1. GET: Obtener todas las reservas (PROTEGIDA)
app.get('/api/reservas', verificarToken, async (req, res) => {
  try {
    const reservas = await Reserva.find();
    res.json(reservas);
  } catch (error) {
    console.error('❌ Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al consultar las reservas' });
  }
});

// 2. POST: Crear una nueva reserva (PROTEGIDA PARA CUALQUIER USUARIO LOGUEADO)
app.post('/api/reservas', verificarToken, async (req, res) => {
  try {
    const nuevaReserva = await Reserva.create(req.body);
    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(400).json({ error: error.message });
  }
});

// 3. DELETE: Eliminar / Cancelar una reserva por ID (PROTEGIDA)
app.delete('/api/reservas/:id', verificarToken, async (req, res) => {
  try {
    const reservaEliminada = await Reserva.findByIdAndDelete(req.params.id);
    if (!reservaEliminada) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json({ mensaje: 'Reserva eliminada correctamente', reservaEliminada });
  } catch (error) {
    console.error('❌ Error al eliminar reserva:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// INICIO Y VERIFICACIÓN DEL SERVIDOR
// ==========================================

// Ruta raíz de verificación
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor TurisPlaY Backend en línea 🚀' });
});

// Conexión a MongoDB Atlas y arranque del servidor
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err);
    app.listen(PORT, () => console.log(`⚠️ Servidor en puerto ${PORT} (sin conexión DB)`));
  });