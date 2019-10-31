const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Company = require('../models/company');
const Device = require('../models/device');

const router = express.Router();

router.use(authMiddleware);

//Listar todas.
  router.get('/', async (req, res) => {
    const listCompanies = await Company.find().sort("-createdAt");
    return res.json(listCompanies);
  }),
  //Selecionar uma compania. 
  router.get('/:companyId', async (req, res) => {
    const { name } = req.body;
    const showCompanies = await Company.findOne(name);
    return res.json(showCompanies);
  }),
  //add company 
  router.post('/company/add', async (req, res) => {

    const { _id } = req.body;

    try {

      if (await Company.findOne({ _id })) return res.status(400).send({ error: 'Company already exists' });

      const company = await Company.create(req.body);


      return res.send({ company });

    } catch (err) {
      return res.status(400).send({ error: 'Registration failed' })

    }

  });
//update company
  router.put('/:companyId', async (req, res) => {
  res.send({ ok: true, company: req.companyId })
  }),
  //delete company
  router.delete('/:companyId', async (req, res) => {
    res.send({ ok: true, company: req.companyId })
  }),

  module.exports = app => app.use('/company', router);

/*
Lista antiga
router.get('/companies', async(req, res) => {
  const companies = await Company.find().sort("-createdAt");
  return res.json(companies);

  });*/