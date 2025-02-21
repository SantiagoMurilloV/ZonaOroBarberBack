const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  admin_idcart: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  telegram_Id:{ type: String},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('admins', adminSchema);
