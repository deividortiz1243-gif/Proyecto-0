
const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('La variable MONGODB_URI no está definida en .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Conectado a MongoDB Atlas con éxito');

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    throw error;
  }
};

module.exports = conectarDB;
