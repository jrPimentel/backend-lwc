const mongoose = require("../../database");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  //guarda o nome.
  name: { type: String, required: true },
  //guarda o email
  email: { type: String, unique: true, required: true, lowercase: true },
  //guarda a senha.
  password: { type: String, required: true, select: false },
  //token de reset pass.
  passwordResetToken: { type: String, select: false },
  //tempo de espiração do reset pass.
  passwordResetExpires: { type: Date, select: false },
  //atribui empresa para usuário.
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  //Para tornar o user root.
  accRoot: { type: Boolean, default: false, required: true },
  //Primeiro acesso
  firstAcc: { type: Boolean, default: true, required: true },
  //Ativo ou não
  active: { type: Boolean, default: true, select: false, required: true },
  //data de criação de conta.
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", async function(next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
