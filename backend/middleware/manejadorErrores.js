// backend/middleware/manejadorErrores.js 
// Este middleware atrapa cualquier fallo imprevisto en los endpoints y responde en formato JSON limpio con el código HTTP correspondiente
const manejadorErrores = (err, req, res, next) => {
  console.error('❌ Error interno:', err.stack);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};

module.exports = manejadorErrores;