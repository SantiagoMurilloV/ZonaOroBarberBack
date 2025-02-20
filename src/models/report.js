const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: true
  },
  type: {
    type: String,
    required: true,
  },
  hours: [{
    type: String
  }],
  dates: [{
    type: String,
  }]
});

module.exports = mongoose.model('Report', reportSchema);
