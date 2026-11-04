
// ==========================================
// 1. CONFIGURACIÓN INICIAL
// ==========================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Conexión a MongoDB
const conectarDB = require('./config/db');

// Modelos
const Sitio = require('./models/Sitio');

// Middleware
const { verificarToken } = require('./middleware/auth');
const verificarAdmin = require('./middleware/admin');

// Rutas modulares
const authRoutes = require('./routes/auth');
const turisRoutes = require('./routes/turisplay');
const reservasRoutes = require('./routes/reservas');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;


// ==========================================
// 2. MIDDLEWARES GLOBALES
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// 3. REGISTRO DE RUTAS MODULARES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/turisplay', turisRoutes);
app.use('/api/reservas', reservasRoutes);


// ==========================================
// 4. RUTAS DE SITIOS TURÍSTICOS (CRUD)
// ==========================================

// GET: Obtener todos los sitios turísticos (Pública)

app.get('/api/sitios', async (req, res, next) => {
  try {
    const sitios = await Sitio.find();
    res.json(sitios);
  } catch (error) {
    next(error);
  }
});


// POST: Crear un sitio turístico (Solo administrador)

app.post('/api/sitios', verificarToken, verificarAdmin, async (req, res, next) => {
  try {
    const nuevoSitio = await Sitio.create(req.body);

    res.status(201).json(nuevoSitio);
  } catch (error) {
    next(error);
  }
});


// PUT: Actualizar un sitio turístico por ID (Solo administrador)

app.put('/api/sitios/:id', verificarToken, verificarAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const sitioActualizado = await Sitio.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!sitioActualizado) {
      return res.status(404).json({
        error: 'Sitio turístico no encontrado para actualizar'
      });
    }

    res.json({
      mensaje: 'Sitio turístico actualizado exitosamente',
      sitioActualizado
    });

  } catch (error) {
    next(error);
  }
});


// DELETE: Eliminar un sitio turístico por ID (Solo administrador)

app.delete('/api/sitios/:id', verificarToken, verificarAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const sitioEliminado = await Sitio.findByIdAndDelete(id);

    if (!sitioEliminado) {
      return res.status(404).json({
        error: 'Sitio turístico no encontrado para eliminar'
      });
    }

    res.status(200).json({
      mensaje: 'Sitio turístico eliminado exitosamente',
      sitioEliminado
    });

  } catch (error) {
    next(error);
  }
});


// ==========================================
// 5. RUTA PRINCIPAL Y SALUD DEL SERVIDOR
// ==========================================

// Ruta raíz

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor TurisPlaY Backend en línea 🚀'
  });
});


// ==========================================
// 6. RUTA PARA ENDPOINTS NO ENCONTRADOS
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada en la API de TurisPlaY'
  });
});


// ==========================================
// 7. MANEJADOR CENTRALIZADO DE ERRORES
// ==========================================

const manejadorErrores = (err, req, res, next) => {
  console.error('❌ Error interno detectado:', err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};

app.use(manejadorErrores);


// ==========================================
// 8. CONEXIÓN A MONGODB Y ARRANQUE
// ==========================================

const startServer = async () => {
  try {
    console.log('Intentando conectar a MongoDB Atlas...');

    await conectarDB();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
