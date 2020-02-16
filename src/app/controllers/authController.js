const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth");

const User = require("../models/user");
const Company = require("../models/company");

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

router.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({ success: true, user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).send({ success: false, error: "Registration failed" });
  }
});

router.post("/admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("password");

    if (!user) return res.status(400).send({ error: "User not found" });
    if (await User.findOne({ email: email, accRoot: false }))
      return res.status(400).send({ error: "User not a root" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).send({ error: "Invalid password" });

    user.password = undefined;

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: 86400
    });

    res.send({
      user,
      token: generateToken({ id: user.id })
    });
  } catch (err) {
    next(err);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, active: true }).select(
      "accRoot firstAcc email password company"
    );

    //Verifica se o usuário existe
    if (!user) return res.status(400).send({ success: false, error: "User not found" });

    //Verifica se é o primeiro acesso
    if (user.firstAcc)
      return res.status(400).send({ success: false, error: "User didn't created a password" });

    //Verifica se é um usuário root
    if (!user.accRoot) return res.status(400).send({ success: false, error: "User not a root" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).send({ success: false, error: "Invalid password" });

    user.password = undefined;

    res.send({
      success: true,
      user,
      token: generateToken({ id: user.id, admin: email === "admin@lanwork.com.br", user })
    });
  } catch (err) {
    console.log(err);
    //next(err);
  }
});

router.get("/logout", function(req, res) {
  res.status(200).send({ token: null });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ error: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });
    mailer.sendMail(
      {
        to: email,
        from: "jreis0116@gmail.com",
        template: "auth/forgot_password",
        context: { token }
      },
      err => {
        console.log(err);
        if (err) return res.status(400).send({ error: "Cannot send forgot password email" });

        return res.send();
      }
    );
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Error on forgot password, try again" });
  }
});

router.post("/reset_password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({ passwordResetToken: token }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user) return res.status(400).send({ error: "User not found" });

    if (token !== user.passwordResetToken) return res.status(400).send({ error: "Token invalid" });

    const now = new Date();

    if (now > user.passwordResetExpires)
      return res.status(400).send({ error: "Token expired, generate a new one" });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.firstAcc = false;

    await user.save();

    res.status(200).send({ success: true });
  } catch (err) {
    res.status(400).send({ error: "Cannot reset password, try again" });
  }
});

router.post("/check_token", async (req, res) => {
  const { token } = req.body;
  const { authorization } = req.headers;

  try {
    const decode = jwt.verify(token, authConfig.secret);

    res.send({ success: true, admin: decode });
  } catch (err) {
    console.log(err);

    res.status(400).send({ success: false, err });
  }
});

module.exports = app => app.use("/auth", router);
