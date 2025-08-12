const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true, unique: true }, 
  price: { type: Number, required: true }, 
  timeRequired: { type: Number, required: true }, 
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('prices', priceSchema);

