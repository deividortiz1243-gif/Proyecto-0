const Reserva = require('../models/Reserva');

// Listar reservas
const obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find().populate('lugar');
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las reservas" });
  }
};

// Crear reserva
const crearReserva = async (req, res) => {
  try {
    const nuevaReserva = new Reserva(req.body);
    await nuevaReserva.save();
    res.status(201).json({ mensaje: "Reserva registrada con éxito", reserva: nuevaReserva });
  } catch (error) {
    res.status(400).json({ error: "Error al registrar la reserva" });
  }
};

module.exports = {
  obtenerReservas,
  crearReserva
};