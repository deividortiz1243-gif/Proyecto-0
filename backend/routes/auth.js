
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const router = express.Router();

const { verificarToken } = require('../middleware/auth');

// ==========================================
// 1. REGISTRO DE USUARIOS
// ==========================================

router.post('/registro', async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      departamento,
      municipio
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Validar formato básico del correo
    const correo = email.trim().toLowerCase();

    // Comprobar si el correo ya existe
    const existe = await Usuario.findOne({ email: correo });

    if (existe) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario: el rol público siempre será turista
    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      email: correo,
      password: hash,
      departamento: departamento || 'Huila',
      municipio: municipio || 'Garzón',
      rol: 'turista'
    });

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      id: usuario._id
    });

  } catch (err) {
    console.error('Error en registro:', err.message);

    res.status(400).json({
      error: 'No fue posible registrar el usuario'
    });
  }
});


// ==========================================
// 2. INICIO DE SESIÓN
// ==========================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'El email y la contraseña son obligatorios'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está configurada');

      return res.status(500).json({
        error: 'Error de configuración del servidor'
      });
    }

    // Buscar usuario
    const correo = email.trim().toLowerCase();

    const usuario = await Usuario.findOne({ email: correo });

    if (!usuario) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    // Comparar contraseña
    const valida = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!valida) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario._id.toString(),
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      nombre: usuario.nombre,
      rol: usuario.rol
    });

  } catch (err) {
    console.error('Error en login:', err.message);

    res.status(500).json({
      error: 'Error interno al iniciar sesión'
    });
  }
});


// ==========================================
// 3. OBTENER PERFIL DEL USUARIO
// ==========================================

router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(
      req.usuario.id
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json(usuario);

  } catch (err) {
    console.error('Error al consultar perfil:', err.message);

    res.status(500).json({
      error: 'Error al obtener el perfil'
    });
  }
});


// ==========================================
// 4. EXPORTAR RUTAS
// ==========================================

module.exports = router;
