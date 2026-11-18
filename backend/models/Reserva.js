
const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({

  // Usuario que realiza la reserva
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },

  // Sitio turístico reservado
  sitio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sitio',
    required: [true, 'El sitio turístico es obligatorio']
  },

  // Fecha de la reserva
  fecha: {
    type: Date,
    required: [true, 'La fecha de la reserva es obligatoria'],
    validate: {
      validator: function (value) {
        return value instanceof Date && !isNaN(value.getTime());
      },
      message: 'La fecha de la reserva no es válida'
    }
  },

  // Cantidad de personas
  cantidadPersonas: {
    type: Number,
    required: [true, 'La cantidad de personas es obligatoria'],
    min: [1, 'Debe haber al menos una persona'],
    validate: {
      validator: Number.isInteger,
      message: 'La cantidad de personas debe ser un número entero'
    }
  },

  // Estado de la reserva
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada'],
    default: 'pendiente'
  }

}, {
  timestamps: true
});

// Exportar modelo
module.exports = mongoose.model('Reserva', reservaSchema);
