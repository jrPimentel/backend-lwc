const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const User = require("../models/user");

const sendTokenToEmail = async email => {
  try {
    const user = await User.findOne({ email });

    const token = crypto.randomBytes(20).toString("hex");
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });

    const info = await mailer.sendMail({
      to: email,
      from: "jreis0116@gmail.com",
      subject: "Ei! Crie sua senha aqui",
      template: "auth/first_access",
      context: { token }
    });

    return info;
  } catch (error) {
    console.log("Something went wrong", error);
    return error;
  }
};

module.exports = sendTokenToEmail;
