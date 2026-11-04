const express = require('express');
const Reserva = require('../models/Reserva');
const { verificarToken } = require('../middleware/auth');
const router = express.Router();

// GET: Obtener todas las reservas (PROTEGIDA)
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

// GET: Obtener reserva por ID (PROTEGIDA)
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('usuario', 'nombre email')
      .populate('sitio', 'nombre municipio');
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json(reserva);
  } catch (error) {
    console.error('❌ Error al consultar la reserva:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST: Crear una nueva reserva (Permite frontend público o con token)
router.post('/', async (req, res) => {
  try {
    const datosReserva = { ...req.body };
    if (req.usuario && req.usuario.id) {
      datosReserva.usuario = req.usuario.id;
    }

    const nuevaReserva = await Reserva.create(datosReserva);
    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT: Actualizar reserva por ID (PROTEGIDA)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const reservaActualizada = await Reserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );
    if (!reservaActualizada) {
      return res.status(404).json({ error: 'Reserva no encontrada para actualizar' });
    }
    res.json(reservaActualizada);
  } catch (error) {
    console.error('❌ Error al actualizar reserva:', error);
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