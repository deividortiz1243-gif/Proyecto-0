
const mongoose = require('mongoose');

const sitioSchema = new mongoose.Schema({

  // Nombre del sitio turístico
  nombre: {
    type: String,
    required: [true, 'El nombre del sitio es obligatorio'],
    trim: true
  },

  // Categoría del sitio
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true
  },

  // Descripción del sitio
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },

  // Ubicación del sitio
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es obligatoria'],
    trim: true
  },

  // Servicios disponibles
  servicios: {
    type: [String],
    default: []
  },

  // Imagen del sitio
  imagen: {
    type: String,
    default: '',
    trim: true
  }

}, {
  timestamps: true
});

// Exportar modelo
module.exports = mongoose.model('Sitio', sitioSchema);
