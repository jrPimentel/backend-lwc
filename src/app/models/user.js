const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  //guarda o nome. 
  name: { 
    type: String,
    required: true,
  },
  //guarda o email 
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  //guarda a senha.
  password: {
    type: String,
    required: true,
    select: false,
  },
  //token de reset pass. 
  passwordResetToken:{
    type: String,
    select: false,
  },
  //tempo de espiração do reset pass.
  passwordResetExpires:{
    type: Date,
    select: false,
  },
  //Atribui uma compania para o usuario.
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
    select: false,
  },
  //Para tornar o user root.
 accRoot: {
    type: Boolean,
    default: null,
    select: false,
  },
  //data de criação de conta. 
  createdAt: {
    type: Date,
    default: Date.now,
  },
})
UserSchema.pre('save', async function(next){
      const hash = await bcrypt.hash(this.password, 10);
      this.password = hash;
      next();
});
const User = mongoose.model('User', UserSchema);

module.exports = User;