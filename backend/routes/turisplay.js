const express = require('express');
const Sitio = require('../models/Sitio');
const { verificarToken } = require('../middleware/auth');
const verificarAdmin = require('../middleware/admin');
const router = express.Router();

// GET: Obtener todos los sitios turísticos (PÚBLICA)
router.get('/sitios', async (req, res) => {
  try {
    const sitios = await Sitio.find();
    res.json(sitios);
  } catch (error) {
    console.error('❌ Error al obtener sitios:', error);
    res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
  }
});

// POST: Crear un nuevo sitio turístico (SOLO ADMIN)
router.post('/sitios', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevoSitio = await Sitio.create(req.body);
    res.status(201).json(nuevoSitio);
  } catch (error) {
    console.error('❌ Error al crear sitio:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT: Actualizar un sitio por su _id (SOLO ADMIN)
router.put('/sitios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const sitioActualizado = await Sitio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );
    if (!sitioActualizado) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado' });
    }
    res.json(sitioActualizado);
  } catch (error) {
    console.error('❌ Error al actualizar sitio:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Eliminar un sitio por su _id (SOLO ADMIN)
router.delete('/sitios/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const sitioEliminado = await Sitio.findByIdAndDelete(req.params.id);
    if (!sitioEliminado) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado' });
    }
    res.json({ mensaje: 'Sitio eliminado correctamente de TurisPlaY', sitioEliminado });
  } catch (error) {
    console.error('❌ Error al eliminar sitio:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;