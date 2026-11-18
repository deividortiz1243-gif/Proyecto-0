
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Reserva = require('../models/Reserva');
const Sitio = require('../models/Sitio');
const { verificarToken } = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

// Comprobar si el usuario es administrador
const esAdministrador = (usuario) => {
  return ['admin', 'administrador'].includes(usuario.rol);
};

// ==========================================
// 1. OBTENER RESERVAS
// ==========================================

router.get('/', verificarToken, async (req, res, next) => {
  try {
    let filtro = {};

    // Los turistas solamente consultan sus reservas.
    // Los administradores pueden consultar todas.
    if (!esAdministrador(req.usuario)) {
      filtro.usuario = req.usuario.id;
    }

    const reservas = await Reserva.find(filtro)
      .populate('usuario', 'nombre email')
      .populate('sitio', 'nombre ubicacion')
      .sort({ createdAt: -1 });

    res.status(200).json(reservas);

  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. OBTENER UNA RESERVA POR ID
// ==========================================

router.get('/:id', verificarToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'El identificador de la reserva no es válido'
      });
    }

    const filtro = { _id: id };

    if (!esAdministrador(req.usuario)) {
      filtro.usuario = req.usuario.id;
    }

    const reserva = await Reserva.findOne(filtro)
      .populate('usuario', 'nombre email')
      .populate('sitio', 'nombre ubicacion');

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    res.status(200).json(reserva);

  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. CREAR UNA RESERVA
// ==========================================

router.post('/', verificarToken, async (req, res, next) => {
  try {
    const { sitio, fecha, cantidadPersonas } = req.body;

    // Validar campos obligatorios
    if (!sitio || !fecha || cantidadPersonas === undefined) {
      return res.status(400).json({
        error: 'Debes proporcionar sitio, fecha y cantidad de personas'
      });
    }

    // Validar ID del sitio
    if (!mongoose.isValidObjectId(sitio)) {
      return res.status(400).json({
        error: 'El identificador del sitio no es válido'
      });
    }

    // Comprobar que el sitio exista
    const sitioExiste = await Sitio.findById(sitio);

    if (!sitioExiste) {
      return res.status(404).json({
        error: 'El sitio turístico no existe'
      });
    }

    // Validar cantidad de personas
    const cantidad = Number(cantidadPersonas);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return res.status(400).json({
        error: 'La cantidad de personas debe ser un entero mayor que cero'
      });
    }

    // Validar fecha
    const fechaReserva = new Date(fecha);

    if (Number.isNaN(fechaReserva.getTime())) {
      return res.status(400).json({
        error: 'La fecha de reserva no es válida'
      });
    }

    // Crear reserva con el usuario autenticado.
    // No se acepta un usuario enviado desde el frontend.
    const nuevaReserva = await Reserva.create({
      usuario: req.usuario.id,
      sitio,
      fecha: fechaReserva,
      cantidadPersonas: cantidad,
      estado: 'pendiente'
    });

    const reservaCompleta = await Reserva.findById(nuevaReserva._id)
      .populate('usuario', 'nombre email')
      .populate('sitio', 'nombre ubicacion');

    res.status(201).json({
      mensaje: 'Reserva realizada con éxito en TurisPlaY',
      reserva: reservaCompleta
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. ACTUALIZAR UNA RESERVA
// ==========================================

router.put('/:id', verificarToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'El identificador de la reserva no es válido'
      });
    }

    const esAdmin = esAdministrador(req.usuario);

    const filtro = { _id: id };

    if (!esAdmin) {
      filtro.usuario = req.usuario.id;
    }

    const datosActualizados = {};

    // Actualizar fecha
    if (req.body.fecha !== undefined) {
      const fecha = new Date(req.body.fecha);

      if (Number.isNaN(fecha.getTime())) {
        return res.status(400).json({
          error: 'La fecha no es válida'
        });
      }

      datosActualizados.fecha = fecha;
    }

    // Actualizar cantidad de personas
    if (req.body.cantidadPersonas !== undefined) {
      const cantidad = Number(req.body.cantidadPersonas);

      if (!Number.isInteger(cantidad) || cantidad < 1) {
        return res.status(400).json({
          error: 'La cantidad debe ser un entero mayor que cero'
        });
      }

      datosActualizados.cantidadPersonas = cantidad;
    }

    // Solo el administrador puede modificar el estado
    if (esAdmin && req.body.estado !== undefined) {
      if (!['pendiente', 'confirmada', 'cancelada'].includes(req.body.estado)) {
        return res.status(400).json({
          error: 'El estado de la reserva no es válido'
        });
      }

      datosActualizados.estado = req.body.estado;
    }

    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({
        error: 'No se enviaron datos válidos para actualizar'
      });
    }

    const reservaActualizada = await Reserva.findOneAndUpdate(
      filtro,
      { $set: datosActualizados },
      {
        new: true,
        runValidators: true
      }
    )
      .populate('usuario', 'nombre email')
      .populate('sitio', 'nombre ubicacion');

    if (!reservaActualizada) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    res.status(200).json({
      mensaje: 'Reserva actualizada correctamente',
      reserva: reservaActualizada
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. CANCELAR UNA RESERVA
// ==========================================

router.patch('/:id/cancelar', verificarToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'El identificador de la reserva no es válido'
      });
    }

    const filtro = { _id: id };

    if (!esAdministrador(req.usuario)) {
      filtro.usuario = req.usuario.id;
    }

    const reserva = await Reserva.findOne(filtro);

    if (!reserva) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    if (reserva.estado === 'cancelada') {
      return res.status(400).json({
        error: 'Esta reserva ya está cancelada'
      });
    }

    reserva.estado = 'cancelada';

    await reserva.save();

    res.status(200).json({
      mensaje: 'Reserva cancelada correctamente',
      reserva
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// 6. ELIMINAR UNA RESERVA (SOLO ADMIN)
// ==========================================

router.delete('/:id', verificarToken, verificarAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: 'El identificador de la reserva no es válido'
      });
    }

    const reservaEliminada = await Reserva.findByIdAndDelete(id);

    if (!reservaEliminada) {
      return res.status(404).json({
        error: 'Reserva no encontrada'
      });
    }

    res.status(200).json({
      mensaje: 'Reserva eliminada correctamente',
      reserva: reservaEliminada
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// 7. EXPORTAR RUTAS
// ==========================================

module.exports = router;
