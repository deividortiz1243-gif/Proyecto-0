const express = require('express');
const router = express.Router();

// Ruta de prueba para verificar que el módulo funciona
router.get('/', (req, res) => {
  res.json({ mensaje: 'Ruta principal de TurisPlay funcionando correctamente 🚀' });
});

// Puedes agregar más rutas de ejemplo aquí abajo si lo deseas:
router.get('/estado', (req, res) => {
  res.json({ status: 'API activa y conectada' });
});

// ¡Fundamental para que Express no dé error!
module.exports = router;