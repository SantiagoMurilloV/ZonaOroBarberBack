const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  id_barbero: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  cel_cliente: { type: String, required: true },
  name_cliente: { type: String, required: true },
  day: { type: String, required: true },
  hours: { type: String, required: true }
});

module.exports = mongoose.model('Reservation', reservationSchema);
