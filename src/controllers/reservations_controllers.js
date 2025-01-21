
const { validationResult } = require('express-validator');
const Reservation = require('../models/reservations');


exports.createReservation = async (req, res) => {
  const { barberId, clientPhone, clientName, userId, typeOfHaircut, day, hours } = req.body;


  const haircutDetails = {
    'Corte': { price: 28000, timeRequired: 45 },
    'Barba': { price: 18000, timeRequired: 30 },
    'Corte y Barba': { price: 38000, timeRequired: 60 }
  };


  const details = haircutDetails[typeOfHaircut];

  if (!details) {
    return res.status(400).send({ error: 'Tipo de corte de cabello no válido' });
  }

  try {
    const newReservation = new Reservation({
      barberId,
      clientPhone,
      clientName,
      userId,
      typeOfHaircut,
      price: details.price,
      timeRequired: details.timeRequired,
      day,
      hours
    });
    await newReservation.save();
    res.status(201).send(newReservation);
  } catch (error) {
    res.status(400).send(error);
  }
};


exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('barberId').populate('userId');
    res.status(200).send(reservations);
  } catch (error) {
    res.status(500).send(error);
  }
};

// GET a single reservation by ID
exports.getReservationById = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id).populate('barberId').populate('userId');
    if (!reservation) {
      return res.status(404).send({ message: 'Reservation not found' });
    }
    res.status(200).send(reservation);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getReservationsByBarber = async (req, res) => {
  const { barberId } = req.params;

  try {
    const reservations = await Reservation.find({ barberId });
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
    const query = { barberId : barberId };
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