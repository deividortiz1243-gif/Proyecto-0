
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Reserva = require('../models/Reserva');
const { verificarToken } = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// Obtener reservas del usuario autenticado.
// Los administradores pueden consultar todas.
router.get('/', verificarToken, async (req, res, next) => {
  try {
    let reservas;

    if (
      req.usuario.rol === 'admin' ||
      req.usuario.rol === 'administrador'
    ) {
      reservas = await Reserva.find()
        .populate('usuario', 'nombre email')
        .populate('sitio', 'nombre municipio')
        .sort({ createdAt: -1 });
    } else {
      reservas = await Reserva.find({
        usuario: req.usuario.id
      })
        .populate('usuario', 'nombre email')
        .populate('sitio', 'nombre municipio')
        .sort({ createdAt: -1 });
    }

    res.json(reservas);

  } catch (error) {
    next(error);
  }
});

// Consultar una reserva específica.
router.get('/:id', verificarToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'El identificador de la reserva no es válido'
      });
    }

    const esAdmin = ['admin', 'administrador'].includes(
      req.usuario.rol
    );

    const filtro = { _id: id };

    if (!esAdmin) {
      filtro.usuario = req.usuario.id;
    }

    const reserva = await Reserva.findOne(filtro)
      .populate('usuario', 'nombre email')
      .populate('sitio', 'nombre municipio');

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    res.json(reserva);

  } catch (error) {
    next(error);
  }
});

// Crear una reserva.
router.post('/', verificarToken, async (req, res, next) => {
  try {
    const { sitio, fecha, cantidadPersonas } = req.body;

    if (!sitio || !fecha || !cantidadPersonas) {
      return res.status(400).json({
        error: 'Debes proporcionar sitio, fecha y cantidad de personas'
      });
    }

    if (!mongoose.isValidObjectId(sitio)) {
      return res.status(400).json({
        error: 'El identificador del sitio no es válido'
      });
    }

    if (
      !Number.isInteger(Number(cantidadPersonas)) ||
      Number(cantidadPersonas) < 1
    ) {
      return res.status(400).json({
        error: 'La cantidad de personas debe ser un número entero mayor que cero'
      });
    }

    const fechaReserva = new Date(fecha);

    if (Number.isNaN(fechaReserva.getTime())) {
      return res.status(400).json({
        error: 'La fecha de reserva no es válida'
      });
    }

    const nuevaReserva = await Reserva.create({
      usuario: req.usuario.id,
      sitio,
      fecha: fechaReserva,
      cantidadPersonas: Number(cantidadPersonas)
    });

    res.status(201).json({
      mensaje: 'Reserva realizada con éxito en TurisPlaY',
      reserva: nuevaReserva
    });

  } catch (error) {
    next(error);
  }
});

// Actualizar una reserva.
router.put('/:id', verificarToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'El identificador de la reserva no es válido'
      });
    }

    const esAdmin = ['admin', 'administrador'].includes(
      req.usuario.rol
    );

    const filtro = { _id: id };

    if (!esAdmin) {
      filtro.usuario = req.usuario.id;
    }

    // No permitir cambiar el propietario ni modificar el estado
    // directamente desde la cuenta de un turista.
    const datosActualizados = {};

    if (req.body.fecha !== undefined) {
      const fecha = new Date(req.body.fecha);

      if (Number.isNaN(fecha.getTime())) {
        return res.status(400).json({
          error: 'La fecha no es válida'
        });
      }

      datosActualizados.fecha = fecha;
    }

    if (req.body.cantidadPersonas !== undefined) {
      const cantidad = Number(req.body.cantidadPersonas);

      if (!Number.isInteger(cantidad) || cantidad < 1) {
        return res.status(400).json({
          error: 'La cantidad de personas debe ser un entero mayor que cero'
        });
      }

      datosActualizados.cantidadPersonas = cantidad;
    }

    if (esAdmin && req.body.estado !== undefined) {
      datosActualizados.estado = req.body.estado;
    }

    const reservaActualizada = await Reserva.findOneAndUpdate(
      filtro,
      { $set: datosActualizados },
      { new: true, runValidators: true }
    );

    if (!reservaActualizada) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    res.json({
      mensaje: 'Reserva actualizada correctamente',
      reserva: reservaActualizada
    });

  } catch (error) {
    next(error);
  }
});

// Cancelar o eliminar una reserva.
// Los turistas solo pueden cancelar las suyas.
// Los administradores pueden eliminar cualquiera.
router.delete('/:id', verificarToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'El identificador de la reserva no es válido'
      });
    }

    const esAdmin = ['admin', 'administrador'].includes(
      req.usuario.rol
    );

    const filtro = { _id: id };

    if (!esAdmin) {
      filtro.usuario = req.usuario.id;
    }

    const reservaEliminada = await Reserva.findOneAndDelete(filtro);

    if (!reservaEliminada) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    res.json({
      mensaje: 'Reserva eliminada correctamente',
      reserva: reservaEliminada
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
