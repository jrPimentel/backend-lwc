const mongoose = require('../../database');

const CompanySchema = new mongoose.Schema({

  name: { 
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

})


const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;