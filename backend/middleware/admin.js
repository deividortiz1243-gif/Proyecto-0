// Middleware: verifica que el usuario autenticado temga el rol admin
function verificarAdmin(req, res, next) {
    if (!req.usuario) {
        return res.status(401).json({ error: 'Sin autenticacion' });
    }
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado - se requiere rol admin' });
    }
    next(); // solo llega aqui si el token existe y el rol es admin
} 

module.exports = verificarAdmin;