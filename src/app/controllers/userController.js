const express = require('express');
const authMiddleware = require('../middlewares/auth');
const User = require('../models/user');
const router = express.Router();

router.use(authMiddleware);

//Lista todos os usuarios
router.get('/users', async(req, res) => {  
  const users = await User.find({accRoot: true}).sort("name");
  return res.json(users);
});



module.exports = app => app.use(router);