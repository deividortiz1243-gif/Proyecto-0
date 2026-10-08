const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  nombreUsuario: { 
    type: String, 
    required: [true, 'El nombre del usuario es obligatorio'] 
  },
  correo: { 
    type: String, 
    required: [true, 'El correo de contacto es obligatorio'] 
  },
  telefono: { 
    type: String 
  },
  // Ahora guardamos directamente el nombre del lugar turístico
  lugar: { 
    type: String, 
    required: [true, 'El nombre del lugar turístico es obligatorio'] 
  },
  fechaReserva: { 
    type: Date, 
    required: [true, 'La fecha de la reserva es obligatoria'] 
  },
  numeroPersonas: { 
    type: Number, 
    default: 1,
    min: [1, 'Debe reservar al menos para 1 persona']
  },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Confirmada', 'Cancelada'], 
    default: 'Pendiente' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Reserva', reservaSchema, 'reservas');