const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const DevicesSchema = new mongoose.Schema({

  name: { 
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordResetToken:{
    type: String,
    select: false,
  },
  passwordResetExpires:{
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

})


const User = mongoose.model('Devices', DevicesSchema);

module.exports = Devices;