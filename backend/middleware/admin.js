// Middleware: verifica que el usuario autenticado tenga el rol admin
function verificarAdmin(req, res, next) {
    if (!req.usuario) {
        return res.status(401).json({ error: 'Sin autenticación' });
    }
    
    // Validamos 'administrador' o 'admin'
    if (req.usuario.rol !== 'administrador' && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado - se requiere rol admin' });
    }
    
    next();
} 

module.exports = verificarAdmin;