
const { validationResult } = require('express-validator');
const Reservation = require('../models/reservations');
const Price = require('../models/prices');
const Barber = require('../models/barbers');
const Admin = require('../models/admin')
const TelegramBot = require('node-telegram-bot-api');
//const token = '7876038771:AAHE3GE2K_88Yz-THno_uM9M3-lCyqjtKFY'
//const bot = new TelegramBot(token, { polling: true });




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
    // 1. Validar que el servicio exista en Price
    const priceDoc = await Price.findOne({ serviceName: typeOfHaircut }).lean();
    if (!priceDoc) {
      return res.status(400).send({ error: 'Servicio no configurado en precios' });
    }

    // 2. Buscar reservas existentes para ese barbero en ese día
    const existingReservations = await Reservation.find({ barberId, day }).lean();

    // 3. Verificar si alguna de las horas ya está ocupada
    const reservedHours = existingReservations.flatMap(r => r.hours); // todas las horas ya ocupadas
    const conflict = hours.some(h => reservedHours.includes(h));

    if (conflict) {
      return res.status(400).send({
        error: 'Esta hora ya no está disponible. Recargue la página para visualizar los horarios disponibles.'
      });
    }

    // 4. Crear la nueva reserva
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

    // 5. Enviar notificación al barbero por Telegram (si aplica)
    const barber = await Barber.findById(barberId);
    if (barber && barber.telegram_Id) {
      const hoursText = Array.isArray(hours)
        ? hours.map(h => `    • ${h}`).join('\n')
        : hours;

      const message = `*Nueva reserva:*\n
        - *Usuario:* ${clientName}
        - *Servicio:* ${typeOfHaircut}
        - *Fecha:* ${day}
        - *Hora:*\n${hoursText}
        - *Ingreso:* $${priceDoc.price}
        - *Tiempo:* ${priceDoc.timeRequired} min\n`;

      bot.sendMessage(barber.telegram_Id, message, { parse_mode: 'Markdown' });
      const admin = await Admin.findOne();
      if (admin?.telegram_Id) {
        bot.sendMessage(admin.telegram_Id, message, { parse_mode: 'Markdown' });
      }
    }

    // 6. Responder al cliente
    res.status(201).send(newReservation);

  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(400).send({ error: "Error al crear reserva", details: error.message });
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
    const query = { barberId: barberId };
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


exports.deleteReservation = async (req, res) => {
  const { reservationId } = req.params;

  try {
    // Elimina y retorna el documento eliminado
    const deletedReservation = await Reservation.findByIdAndDelete(reservationId).lean();
    if (!deletedReservation) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Buscar el barbero para obtener su telegram_Id
    let barberTelegramId = null;
    if (deletedReservation.barberId) {
      const barber = await Barber.findById(deletedReservation.barberId).lean();
      barberTelegramId = barber?.telegram_Id || null;
    }

    const hoursText = Array.isArray(deletedReservation.hours)
      ? deletedReservation.hours.map(h => `    • ${h}`).join('\n')
      : deletedReservation.hours;

    const msg =
      `*Reserva eliminada*\n` +
      `- *Cliente:* ${deletedReservation.clientName}\n` +
      `- *Fecha:* ${deletedReservation.day}\n` +
      `- *Hora:*\n${hoursText}\n`;


    // Enviar al barbero (si tiene Telegram vinculado)
    if (barberTelegramId) {
      bot.sendMessage(barberTelegramId, msg, { parse_mode: 'Markdown' }).catch(console.error);
    }

    // Enviar a admin si está configurado
    const admin = await Admin.findOne();
    const adminTelegramId = admin.telegram_Id;
    if (adminTelegramId) {
      bot.sendMessage(adminTelegramId, msg, { parse_mode: 'Markdown' }).catch(console.error);
    }

    // Respuesta HTTP
    return res.json({
      message: 'Reserva eliminada con éxito',
      deletedReservation
    });
  } catch (error) {
    console.error('Error al eliminar la reserva:', error);
    return res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
};




