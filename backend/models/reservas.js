const mongoose = require('mongoose');

const lugarSchema = new mongoose.Schema({
  // Campos de tu entidad principal
  nombre: { 
    type: String, 
    required: [true, 'El nombre del lugar es obligatorio'] 
  },
  descripcion: { 
    type: String 
  },
  ubicacion: { 
    type: String, 
    required: [true, 'La ubicación es obligatoria'] 
  },
  categoria: { 
    type: String, 
    required: [true, 'La categoría es obligatoria'] 
  },
  imagen: { 
    type: String 
  },
  precio: { 
    type: Number, 
    default: 0 
  },

  // Referencia al usuario (admin) que creó el registro
  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario' 
  }
}, { 
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// El tercer argumento 'lugares' le indica a Mongoose la colección exacta en Atlas
module.exports = mongoose.model('Lugar', lugarSchema, 'lugares');