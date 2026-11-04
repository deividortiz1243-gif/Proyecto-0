
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({

  // Nombre del usuario
  nombre: {
    type: String,
    required: true,
    trim: true
  },

  // Correo electrónico
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Contraseña encriptada con bcrypt
  password: {
    type: String,
    required: true
  },

  // Rol del usuario
  rol: {
    type: String,
    enum: ['administrador', 'admin', 'cliente', 'turista'],
    default: 'turista'
  },

  // Ubicación del usuario
  departamento: {
    type: String,
    default: 'Huila',
    trim: true
  },

  municipio: {
    type: String,
    default: 'Garzón',
    trim: true
  }

}, {
  timestamps: true
});

// Exportar modelo
module.exports = mongoose.model('Usuario', usuarioSchema);
