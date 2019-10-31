const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const CompanySchema = new mongoose.Schema({
  
  companyName: { 
    type: String,
    required: true,
  },
  companyLocation: { 
    type: String,
    required: false,
  },
  adminEmail: {
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
  devices:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devices',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})


const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;