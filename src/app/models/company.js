const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const CompanySchema = new mongoose.Schema({
  //Nome da compania.
  name: { type: String, required: true },
  //Local compania.
  email: { type: String, unique: true, required: true, lowercase: true },
  //guarda a senha.
  password: { type: String, required: true, select: false },
  //token de reset pass. 
  passwordResetToken:{ type: String, select: false },
  //tempo de espiração do reset pass.
  passwordResetExpires:{ type: Date, select: false },
  location: { type: String, required: false },
  //Dispositovos cadastrados.
  devices:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Devices' }],
  //usuario admin da compania. 
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  //data de criação da compania. 
  createdAt: { type: Date, default: Date.now},
})
CompanySchema.pre('save', async function(next){
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});
const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;