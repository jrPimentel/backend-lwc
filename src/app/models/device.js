const mongoose = require("../../database");
const bcrypt = require("bcryptjs");

const DeviceSchema = new mongoose.Schema({
  //nome para o dispositivo.
  name: { type: String, required: true },
  //Tipo do dispositivo.
  type: { type: String, required: true },
  //atribui usuario para o dispositivo.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, //Alterar o required em futuras versões
  //atribui empresa para o dispositivo.
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  //data que o dispositivo foi criado.
  createdAt: { type: Date, default: Date.now }
});
const Device = mongoose.model("Device", DeviceSchema);

module.exports = Device;
