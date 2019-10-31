const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Device = require('../models/device');
const router = express.Router();

router.use(authMiddleware);

//Lista todos os devices
router.get('/devices', async(req, res) => {
  const devices = await Device.find().sort("-createdAt");
  return res.json(devices);
   
  });
  //add device
router.post('/devices/add', async (req, res) => {
  
    const { _id } = req.body;
    
    try{
  
      if(await Device.findOne({ _id })) return res.status(400).send({ error: 'Device already exists'});
  
      const device = await Device.create(req.body);
  
  
      return res.send({device});

    } catch (err){
      return res.status(400).send({ error: 'Registration failed'})
      
    }
  
  });
module.exports = app => app.use('/auth', router);