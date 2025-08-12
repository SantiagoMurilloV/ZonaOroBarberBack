
const { validationResult } = require('express-validator');
const Reservation = require('../models/reservations');
const Price = require('../models/prices');
const Barber = require('../models/barbers'); 
const TelegramBot = require('node-telegram-bot-api');
const token = '7876038771:AAHE3GE2K_88Yz-THno_uM9M3-lCyqjtKFY'
const bot = new TelegramBot(token, { polling: true});




  exports.getAllReservations = async (req, res) => {
    try {
      const reservations = await Reservation.find()
      res.status(200).send(reservations);
    } catch (error) {
      res.status(500).send(error);
    }
  };


exports.createReservation = async (req, res) => {
  const { barberId, clientPhone, clientName, userId, typeOfHaircut, day, hours } = req.body;

  try {

    const priceDoc = await Price.findOne({ serviceName: typeOfHaircut }).lean();
    if (!priceDoc) {
      return res.status(400).send({ error: 'Servicio no configurado en precios' });
    }

    const newReservation = new Reservation({
      barberId,
      clientPhone,
      clientName,
      userId,
      typeOfHaircut,
      price: priceDoc.price,
      timeRequired: priceDoc.timeRequired,
      day,
      hours
    });


    await newReservation.save();


    const barber = await Barber.findById(barberId);
    if (barber && barber.telegram_Id) {

      const message = `*Nueva reserva:*\n
      - *Usuario:* ${clientName}
      - *#cel:* ${clientPhone}
      - *Servicio:* ${typeOfHaircut}
      - *Fecha:* ${day}
      - *Hora:* ${hours}
      - *Ingreso:* $${priceDoc.price}
      - *Tiempo:* ${priceDoc.timeRequired} min\n`;
      
      


      bot.sendMessage(barber.telegram_Id, message, { parse_mode: 'Markdown' });
      const adminTelegramId = 'YOUR_ADMIN_TELEGRAM_ID'; 
      bot.sendMessage(adminTelegramId, message);
    }

    res.status(201).send(newReservation);
  } catch (error) {
    res.status(400).send(error);
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
      query.day = day; 
    }
    const reservations = await Reservation.find(query).sort({ hours: 1 });
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener las reservas del barbero:', error);
    res.status(500).json({ error: 'Error al obtener las reservas del barbero' });
  }
};


exports.deleteReservation = (req, res) => {
  const reservationId = req.params.reservationId;
  
  Reservation.findByIdAndDelete(reservationId)
    .then(deletedReservation => {
      if (!deletedReservation) return res.status(404).json({ error: 'Barbero no encontrado' });
      res.json({ message: 'Barbero eliminado con éxito', deletedReservation });
    })
    .catch(error => res.status(500).json({ error: 'Error al eliminar el barbero' }));
};



