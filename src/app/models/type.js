const mongoose = require("../../database");

const TypeSchema = new mongoose.Schema({
  //guarda o nome.
  name: { type: String, required: true },
  //data de criação de conta.
  createdAt: { type: Date, default: Date.now }
});

const Type = mongoose.model("Type", TypeSchema);

module.exports = Type;
