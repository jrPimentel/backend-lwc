const mongoose = require('../../database');

const DeviceSchema = new mongoose.Schema({

  name: { 
    type: String,
    required: true,
  },

  QRCode: {
    type: String,
    required: false,
    default: null,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },

})


const Device = mongoose.model('Devices', DeviceSchema);

module.exports = Device;