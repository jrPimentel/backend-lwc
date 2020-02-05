const mongoose = require("../../database");
const bcrypt = require("bcryptjs");

const CompanySchema = new mongoose.Schema({
  //Nome da compania.
  name: { type: String, required: true },
  //Local compania.
  location: { type: String, required: false },
  //usuario admin da compania.
  rootUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  //Ativo ou não
  active: { type: Boolean, default: true, select: false, required: true },
  //data de criação da compania.
  createdAt: { type: Date, default: Date.now }
});

const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
