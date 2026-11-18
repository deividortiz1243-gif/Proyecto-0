
const express = require('express');
const mongoose = require('mongoose');

const Sitio = require('../models/Sitio');
const { verificarToken } = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');

const router = express.Router();

// Campos permitidos para crear o actualizar sitios
const camposPermitidos = [
  'nombre',
  'categoria',
  'descripcion',
  'ubicacion',
  'servicios',
  'imagen'
];

// GET: Obtener todos los sitios turísticos (PÚBLICO)
router.get('/sitios', async (req, res, next) => {
  try {
    const sitios = await Sitio.find().sort({ createdAt: -1 });
    res.status(200).json(sitios);
  } catch (error) {
    next(error);
  }
});

// GET: Obtener un sitio por su ID (PÚBLICO)
router.get('/sitios/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'El ID del sitio no es válido'
      });
    }

    const sitio = await Sitio.findById(id);

    if (!sitio) {
      return res.status(404).json({
        error: 'Sitio turístico no encontrado'
      });
    }

    res.status(200).json(sitio);
  } catch (error) {
    next(error);
  }
});

// POST: Crear un sitio turístico (SOLO ADMINISTRADOR)
router.post('/sitios', verificarToken, verificarAdmin, async (req, res, next) => {
  try {
    const datosSitio = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        datosSitio[campo] = req.body[campo];
      }
    }

    const nuevoSitio = await Sitio.create(datosSitio);

    res.status(201).json({
      mensaje: 'Sitio turístico creado correctamente',
      sitio: nuevoSitio
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Actualizar un sitio turístico (SOLO ADMINISTRADOR)
router.put('/sitios/:id', verificarToken, verificarAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'El ID del sitio no es válido'
      });
    }

    const datosActualizados = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        datosActualizados[campo] = req.body[campo];
      }
    }

    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({
        error: 'No se enviaron campos válidos para actualizar'
      });
    }

    const sitioActualizado = await Sitio.findByIdAndUpdate(
      id,
      datosActualizados,
      {
        new: true,
        runValidators: true
      }
    );

    if (!sitioActualizado) {
      return res.status(404).json({
        error: 'Sitio turístico no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Sitio turístico actualizado correctamente',
      sitio: sitioActualizado
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Eliminar un sitio turístico (SOLO ADMINISTRADOR)
router.delete('/sitios/:id', verificarToken, verificarAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'El ID del sitio no es válido'
      });
    }

    const sitioEliminado = await Sitio.findByIdAndDelete(id);

    if (!sitioEliminado) {
      return res.status(404).json({
        error: 'Sitio turístico no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Sitio turístico eliminado correctamente',
      sitio: sitioEliminado
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
