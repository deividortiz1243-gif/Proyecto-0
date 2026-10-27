const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  contenido: { 
    type: String, 
    required: [true, 'El contenido del comentario es obligatorio'],
    trim: true,
    maxlength: [500, 'El comentario no puede exceder los 500 caracteres']
  },
  calificacion: { 
    type: Number, 
    required: [true, 'La calificación es obligatoria'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  sitio: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sitio', 
    required: [true, 'El ID del sitio turístico es obligatorio'] 
  },
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: [true, 'El ID del usuario es obligatorio'] 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Comentario', comentarioSchema, 'comentarios');