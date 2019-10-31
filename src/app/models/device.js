const mongoose = require('../../database');

const DeviceSchema = new mongoose.Schema({

  name: { 
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    required: false,
    default: null,
  },
  qrState: {
    type: Boolean,
    required: true,
    default: false,
  },
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },

})


const Device = mongoose.model('Devices', DeviceSchema);

module.exports = Device;