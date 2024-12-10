
const { validationResult } = require('express-validator');
const Reservation = require('../models/reservations');


exports.createReservation = async (req, res) => {
  try {
    const { id_barbero, cel_cliente, name_cliente, day, hours } = req.body;

    const newReservation = new Reservation({
      id_barbero,
      cel_cliente,
      name_cliente,
      day,
      hours
    });

    const savedReservation = await newReservation.save();

    res.status(201).json({ message: 'Reserva creada exitosamente', reservation: savedReservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};


exports.getReservationsByBarber = async (req, res) => {
  const { id_barbero } = req.params;

  try {
    const reservations = await Reservation.find({ id_barbero });
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

exports.getReservationsByBarberDay = async (req, res) => {
  const { barberId } = req.params;
  const { day } = req.query;

  try {
    const query = { id_barbero: barberId };
    if (day) {
      query.day = day; // Filtrar por día si se proporciona
    }
    const reservations = await Reservation.find(query).sort({ hours: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener las reservas del barbero:', error);
    res.status(500).json({ error: 'Error al obtener las reservas del barbero' });
  }
};