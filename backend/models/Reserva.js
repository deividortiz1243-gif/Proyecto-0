
const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  sitio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sitio',
    required: true
  },

  fecha: {
    type: Date,
    required: true
  },

  cantidadPersonas: {
    type: Number,
    required: true,
    min: 1
  },

  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada'],
    default: 'pendiente'
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Reserva', reservaSchema);
