
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

    // Validar campos obligatorios y tipos de datos
    if (
      typeof nombre !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !nombre.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'Nombre, email y contraseña son obligatorios'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    const correo = email.trim().toLowerCase();

    // Validación básica del correo
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correo)) {
      return res.status(400).json({
        error: 'El formato del correo electrónico no es válido'
      });
    }

    // Comprobar si el correo ya existe
    const existe = await Usuario.findOne({ email: correo });

    if (existe) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario
    // El registro público siempre asigna el rol turista
    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      email: correo,
      password: hash,
      departamento:
        typeof departamento === 'string' && departamento.trim()
          ? departamento.trim()
          : 'Huila',
      municipio:
        typeof municipio === 'string' && municipio.trim()
          ? municipio.trim()
          : 'Garzón',
      rol: 'turista'
    });

    return res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      id: usuario._id
    });

  } catch (error) {
    console.error('Error en registro:', error.message);

    // Controlar correo duplicado
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    return res.status(400).json({
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

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
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

    const correo = email.trim().toLowerCase();

    // Buscar usuario
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

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      nombre: usuario.nombre,
      rol: usuario.rol
    });

  } catch (error) {
    console.error('Error en login:', error.message);

    return res.status(500).json({
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

    return res.status(200).json(usuario);

  } catch (error) {
    console.error('Error al consultar perfil:', error.message);

    return res.status(500).json({
      error: 'Error al obtener el perfil'
    });
  }
});

// ==========================================
// 4. EXPORTAR RUTAS
// ==========================================

module.exports = router;
