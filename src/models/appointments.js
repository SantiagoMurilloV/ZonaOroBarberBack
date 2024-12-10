const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  barber_id: { type: mongoose.Schema.Types.ObjectId, ref: 'barbers', required: true },
  appointment_date: { type: Date, required: true },
  service_type: { type: String, required: true }, // Tipo de servicio, como corte, afeitado, etc.
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('appointments', appointmentSchema);
