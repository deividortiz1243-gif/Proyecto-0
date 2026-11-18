
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({

  // Nombre del usuario
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },

  // Correo electrónico
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },

  // Contraseña encriptada con bcrypt
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },

  // Rol del usuario
  rol: {
    type: String,
    enum: ['administrador', 'admin', 'cliente', 'turista'],
    default: 'turista'
  },

  // Departamento del usuario
  departamento: {
    type: String,
    default: 'Huila',
    trim: true
  },

  // Municipio del usuario
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
