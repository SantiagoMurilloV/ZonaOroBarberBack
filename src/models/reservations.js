const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  clientPhone: { type: String, required: true },
  clientName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  typeOfHaircut: { type: String, required: true },
  price: { type: Number  },
  timeRequired: { type: Number }, 
  day: { type: String, required: true },
  hours: { type: String, required: true }, 
  appointmentEnded: { type: String }, 
  attendance: { type: String  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
