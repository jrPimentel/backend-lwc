const express = require('express');
const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth');

const Device = require('../models/device');

const router = express.Router();

function generateToken(params ={} ){
  
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  })

}

router.get('/devices', async(req, res) => {
  const devices = await Device.find().sort("-createdAt");
  return res.json(devices);
   
  });
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