
// ==========================================
// 1. CONFIGURACIÓN INICIAL
// ==========================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Conexión a MongoDB
const conectarDB = require('./config/db');

// Rutas
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
// 3. RUTA PRINCIPAL
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: 'Servidor TurisPlaY Backend en línea',
    estado: 'Funcionando correctamente'
  });
});


// ==========================================
// 4. REGISTRO DE RUTAS MODULARES
// ==========================================

// Autenticación
app.use('/api/auth', authRoutes);

// Sitios turísticos
app.use('/api/turisplay', turisRoutes);

// Reservas
app.use('/api/reservas', reservasRoutes);


// ==========================================
// 5. RUTA PARA ENDPOINTS NO ENCONTRADOS
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada en la API de TurisPlaY'
  });
});


// ==========================================
// 6. MANEJADOR CENTRALIZADO DE ERRORES
// ==========================================

app.use((err, req, res, next) => {
  console.error('Error interno detectado:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: statusCode === 500
      ? 'Error interno del servidor'
      : err.message,
    timestamp: new Date().toISOString()
  });
});


// ==========================================
// 7. CONEXIÓN A MONGODB Y ARRANQUE
// ==========================================

const startServer = async () => {
  try {
    console.log('Intentando conectar a MongoDB Atlas...');

    await conectarDB();

    app.listen(PORT, () => {
      console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
