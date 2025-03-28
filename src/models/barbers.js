const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  barber_idcart: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  telegram_Id:{ type: String},
  svgImage: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('barbers', barberSchema);
