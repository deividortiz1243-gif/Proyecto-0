
// Middleware para verificar permisos de administrador

function verificarAdmin(req, res, next) {

    // Comprobar que el usuario esté autenticado
    if (!req.usuario) {
        return res.status(401).json({
            error: 'Acceso denegado: Usuario no autenticado'
        });
    }

    // Comprobar que tenga rol de administrador
    const rol = req.usuario.rol;

    if (rol !== 'admin' && rol !== 'administrador') {
        return res.status(403).json({
            error: 'Acceso denegado: Se requieren permisos de administrador'
        });
    }

    // Si cumple los requisitos, continúa
    next();
}

module.exports = verificarAdmin;
