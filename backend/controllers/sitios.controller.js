const Sitio = require('../models/Sitio');

// Listar todos los sitios
const obtenerSitios = async (req, res) => {
  try {
    const sitios = await Sitio.find();
    res.status(200).json(sitios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los sitios turísticos" });
  }
};

// Crear un nuevo sitio
const crearSitio = async (req, res) => {
  try {
    const nuevoSitio = new Sitio(req.body);
    await nuevoSitio.save();
    res.status(201).json(nuevoSitio);
  } catch (error) {
    res.status(400).json({ error: "Error al crear el sitio turístico" });
  }
};

// Eliminar un sitio por ID
const eliminarSitio = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Sitio.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ error: "Sitio no encontrado" });
    
    res.status(200).json({ mensaje: `Sitio eliminado correctamente con ID: ${id}` });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el sitio" });
  }
};

module.exports = {
  obtenerSitios,
  crearSitio,
  eliminarSitio
};