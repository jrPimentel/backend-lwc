const express = require('express');
const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth');

const Company = require('../models/company');

const router = express.Router();

router.get('/companies', async(req, res) => {
  const companies = await Company.find().sort("-createdAt");
  return res.json(companies);
   
  });
router.post('/company/add', async (req, res) => {
  
    const { _id } = req.body;
    
    try{
  
      if(await Company.findOne({ _id })) return res.status(400).send({ error: 'Company already exists'});
  
      const company = await Company.create(req.body);
  
  
      return res.send({company});
      
    } catch (err){
      return res.status(400).send({ error: 'Registration failed'})
      
    }
  
  });

module.exports = app => app.use('/auth', router);