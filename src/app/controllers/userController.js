const express = require("express");
const authMiddleware = require("../middlewares/auth");
const User = require("../models/user");
const router = express.Router();

router.use(authMiddleware);

//Lista todos os usuarios
router.get("/users", async (req, res) => {
  const users = await User.find({ accRoot: true }).sort("name");
  return res.json(users);
});

//Lista todos os usuários por uma empresa
router.get("/users/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const users = await User.find({ company: companyId }).sort("name");
  return res.json(users);
});

//TODO: Add user
// Create user
router.post("/users", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({ success: true, user });
  } catch (err) {
    console.log(err);

    return res.status(400).send({ success: false, error: "Registration failed" });
  }
});

//TODO: Delete user
//TODO: Update user

module.exports = app => app.use(router);
