const mongoose = require("../../database");

const DeviceSchema = new mongoose.Schema({
  //nome para o dispositivo.
  name: { type: String, required: true },
  //Tipo do dispositivo.
  type: { type: mongoose.Schema.Types.ObjectId, ref: "Type", required: true },
  //atribui empresa para o dispositivo.
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  //data que o dispositivo foi criado.
  createdAt: { type: Date, default: Date.now }
});

const Device = mongoose.model("Device", DeviceSchema);

module.exports = Device;
