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
//TODO: Delete user
//TODO: Update user

module.exports = app => app.use(router);
