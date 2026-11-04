const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const { verificarToken } = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// 1. GET: Obtener todas las reservas/pedidos (Pública o para Admin)
router.get('/', async (req, res) => {
  try {
    const reservas = await Reserva.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (error) {
    console.error('❌ Error al consultar reservas:', error);
    res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
  }
});

// 2. POST: Registrar una nueva reserva o pedido desde la web
router.post('/', async (req, res) => {
  try {
    const nuevaReserva = await Reserva.create(req.body);
    res.status(201).json({
      mensaje: '¡Reserva realizada con éxito en TurisPlaY!',
      reserva: nuevaReserva
    });
  } catch (error) {
    console.error('❌ Error al guardar reserva:', error);
    res.status(400).json({ error: error.message });
  }
});

// 3. DELETE: Eliminar una reserva por su _id (SOLO ADMIN)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
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

module.exports = router;