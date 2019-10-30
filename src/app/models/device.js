const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const DeviceSchema = new mongoose.Schema({

  name: { 
    type: String,
    required: true,
  },

  QRCode: {
    type: String,
    required: false,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },

})


const Device = mongoose.model('Devices', DeviceSchema);

module.exports = Device;