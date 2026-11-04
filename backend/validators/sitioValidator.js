// backend/validators/sitioValidator.js
const validarSitio = (req, res, next) => {
  const { nombre, categoria, ubicacion } = req.body;
  
  if (!nombre || !categoria || !ubicacion) {
    return res.status(400).json({ 
      error: "Validación fallida: Los campos nombre, categoría y ubicación son obligatorios." 
    });
  }
  
  next();
};

module.exports = { validarSitio };