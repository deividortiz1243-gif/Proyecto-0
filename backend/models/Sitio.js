const mongoose = require('mongoose');

const sitioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del sitio es obligatorio']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  ubicacion: {
    type: String,
    required: [true, 'La ubicación es obligatoria']
  },
  imagen: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Agrega fecha de creación y actualización automáticamente
});

module.exports = mongoose.model('Sitio', sitioSchema);