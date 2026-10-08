const jwt = require('jsonwebtoken');

// Middleware para verificar que la petición incluya un token JWT válido
function verificarToken(req, res, next) {
  // Obtener el header Authorization de la petición
  const authHeader = req.headers['authorization'];
  
  // Extraer el token separando "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Token de autenticación requerido' });
  }

  try {
    // Verificar y decodificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardar los datos del usuario (id, email, rol) en la petición
    req.usuario = decoded;
    
    next(); // Pasar a la siguiente función o ruta
  } catch (err) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// Middleware opcional para restringir acciones exclusivas de administradores en TurisPlaY
function esAdmin(req, res, next) {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de administrador' });
  }
}

module.exports = { verificarToken, esAdmin };