// 1. Importar dependencias
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const router  = express.Router();

// Importante: desestructuración { verificarToken }
const { verificarToken } = require('../middleware/auth');

// 2. POST /api/auth/registro - Crear cuenta nueva
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, departamento, municipio, rol } = req.body;

    // Verificar que el email no exista ya
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar la contraseña con 10 rondas de bcrypt
    const hash = await bcrypt.hash(password, 10);

    // Guardar el usuario con la contraseña encriptada
    const usuario = await Usuario.create({
      nombre,
      email,
      password: hash,
      departamento: departamento || 'Huila',
      municipio: municipio || 'Garzón',
      rol: rol || 'turista'
    });

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      id: usuario._id
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. POST /api/auth/login - Iniciar sesión y recibir token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Comparar la contraseña con el hash guardado en Atlas
    const valida = await bcrypt.compare(password, usuario.password);
    if (!valida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Crear el token JWT - dura 24 horas
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      nombre: usuario.nombre,
      rol: usuario.rol
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /api/auth/perfil - Obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Exportar el router
module.exports = router;