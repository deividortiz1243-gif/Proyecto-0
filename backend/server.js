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

// Middlewares globales
app.use(cors());
app.use(express.json());

// Importar rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api/turisplay', turisRoutes);

// ==========================================
// 1. RUTAS DE SITIOS TURÍSTICOS (CRUD COMPLETO)
// ==========================================

// GET: Obtener todos los sitios (Pública)
app.get('/api/sitios', async (req, res) => {
  try {
    const sitios = await Sitio.find();
    res.json(sitios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos de los sitios' });
  }
});

// POST: Crear un sitio turístico (Protegida: Solo Admin)
app.post('/api/sitios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevoSitio = await Sitio.create(req.body);
    res.status(201).json(nuevoSitio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT: Actualizar un sitio turístico por ID (Protegida: Solo Admin)
app.put('/api/sitios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sitioActualizado = await Sitio.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!sitioActualizado) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado para actualizar' });
    }

    res.json({
      mensaje: 'Sitio turístico actualizado exitosamente',
      sitioActualizado
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Eliminar un sitio turístico por ID (Protegida: Solo Admin)
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
// 2. RUTAS DE RESERVAS (CRUD COMPLETO)
// ==========================================

// GET: Consultar todas las reservas (Protegida: Solo Admin / Usuario con Token)
app.get('/api/reservas', verificarToken, async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar reservas' });
  }
});

// POST: Crear una reserva (Pública para clientes)
app.post('/api/reservas', async (req, res) => {
  try {
    const nuevaReserva = await Reserva.create(req.body);
    res.status(201).json({
      mensaje: 'Reserva registrada exitosamente',
      reserva: nuevaReserva
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT: Actualizar estado de una reserva (Protegida: Solo Admin)
app.put('/api/reservas/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reservaActualizada = await Reserva.findByIdAndUpdate(id, req.body, { new: true });

    if (!reservaActualizada) {
      return res.status(404).json({ error: 'Reserva no encontrada para actualizar' });
    }

    res.json({
      mensaje: 'Estado de reserva actualizado correctamente',
      reservaActualizada
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 3. RUTAS DE CONTROL Y SALUD DEL SERVIDOR
// ==========================================

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor TurisPlaY Backend en línea 🚀' });
});

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada en la API de TurisPlaY' });
});

// ==========================================
// 4. CONEXIÓN A MONGODB ATLAS Y PUERTO
// ==========================================
const startServer = async () => {
  try {
    console.log('Intentando conectar a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Conectado a MongoDB Atlas con éxito');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Funcionando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error fatal al iniciar el servidor:', err.message);
    process.exit(1);
  }
};

startServer();