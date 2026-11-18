const jwt = require('jsonwebtoken');

// ==========================================
// 1. VERIFICAR TOKEN JWT
// ==========================================

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    // Comprobar que exista el encabezado Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Acceso denegado: Token de autenticación requerido'
        });
    }

    const token = authHeader.split(' ')[1];

    // Comprobar que exista la clave secreta
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET no está configurada');

        return res.status(500).json({
            error: 'Error de configuración del servidor'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Guardar los datos del usuario autenticado
        req.usuario = decoded;
        next();
    } catch (error) {

        return res.status(403).json({
            error: 'Token inválido o expirado'
        });

    }
}

// ==========================================
// 2. VERIFICAR SI ES ADMINISTRADOR
// ==========================================

function esAdmin(req, res, next) {

    if (!req.usuario) {
        return res.status(401).json({
            error: 'Usuario no autenticado'
        });
    }
    
    if (
        req.usuario.rol !== 'admin' &&
        req.usuario.rol !== 'administrador'
    ) {
        return res.status(403).json({
            error: 'Acceso denegado: Se requieren permisos de administrador'
        });
    }
    next();
}

// ==========================================
// 3. EXPORTAR FUNCIONES
// ==========================================

module.exports = {
    verificarToken,
    esAdmin
};
