const express = require("express");
const authMiddleware = require("../middlewares/auth");

//Models
const User = require("../models/user");
const Company = require("../models/company");
//Utils
const sendTokenToEmail = require("../utils/sendTokenToEmail");

const router = express.Router();

router.use(authMiddleware);

//Lista todos os usuarios
router.get("/users", async (req, res) => {
  const users = await User.find().sort("name");
  return res.json(users);
});

//Lista todos os usuários por uma empresa
router.get("/users/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const users = await User.find({ company: companyId }).sort("name");
  return res.json(users);
});

// Create user
router.post("/users", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);

    //Send email to create password
    await sendTokenToEmail(email);

    user.password = undefined;

    return res.send({ success: true, user, users: await User.find().sort("name") });
  } catch (err) {
    console.log(err);

    return res.status(400).send({ success: false, error: "Registration failed" });
  }
});

//TODO: Delete user
router.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    //Check if the user exists
    if (!(await User.find({ _id: userId })))
      return res.status(400).send({ success: false, error: "User not found" });

    //Check if the user is been used as root by a company
    if ((await Company.find({ rootUser: userId })).length > 0)
      return res.status(400).send({ success: false, error: "This user is root for a company" });

    await User.findOneAndDelete({ _id: userId });
    const users = await User.find().sort("name");

    return res.send({ success: true, users });
  } catch (err) {
    console.log(err);

    return res.status(400).send({ success: false });
  }
});
//TODO: Update user

router.post("/users/update", async (req, res) => {
  const { token } = req.body;

  try {
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findOneAndUpdate(
      { passwordResetToken: token },
      { $set: { passwordResetExpires: now } }
    );

    const user = await User.findOne({
      passwordResetToken: token
    }).select("passwordResetExpires createdAt");

    console.log(user.passwordResetExpires.toString());
    console.log(user.createdAt instanceof Date);

    return res.send({ success: true, user });
  } catch (error) {
    console.log(error);
    res.send({ success: false });
  }
});

module.exports = app => app.use(router);
