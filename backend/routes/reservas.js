const express = require('express');
const Reserva = require('../models/Reserva');
const { verificarToken } = require('../middleware/auth');
const router = express.Router();

// GET: Obtener reservas del usuario (PROTEGIDA)
router.get('/', verificarToken, async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuario: req.usuario.id })
      .populate('usuario', 'nombre email')
      .populate('sitio', 'nombre municipio');
    res.json(reservas);
  } catch (error) {
    console.error('❌ Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al consultar las reservas' });
  }
});

// POST: Crear una nueva reserva (PROTEGIDA)
router.post('/', verificarToken, async (req, res) => {
  try {
    const nuevaReserva = await Reserva.create({
      ...req.body,
      usuario: req.usuario.id
    });
    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Cancelar / Eliminar reserva por ID (PROTEGIDA)
router.delete('/:id', verificarToken, async (req, res) => {
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