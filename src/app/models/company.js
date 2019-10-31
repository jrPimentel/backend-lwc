const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const CompanySchema = new mongoose.Schema({
  
  name: { 
    type: String,
    required: true,
  },
  location: { 
    type: String,
    required: false,
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
    default: null,
  },
  passwordResetExpires:{
    type: Date,
    select: false,
    default: null,
  },
  devices:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devices',
  }],
  userCompany:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})


const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;