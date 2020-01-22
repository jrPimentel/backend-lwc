const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Company = require("../models/company");
const User = require("../models/user");
const router = express.Router();

router.use(authMiddleware);

//Listar todas.
router.get("/", async (req, res) => {
  const listCompanies = await Company.find().sort("name");
  return res.json(listCompanies);
}),
  //Selecionar uma compania.
  router.get("/:companyId", async (req, res) => {
    const { name } = req.body;
    const showCompanies = await Company.findOne(name);
    console.log(showCompanies);
    return res.json(showCompanies);
  }),
  //add company
  router.post("/add", async (req, res) => {
    const { name } = req.body;
    try {
      // if(await User.findOne({ accRoot: false })) return res.status(400).send({ error: 'User not a root'});
      if (await Company.findOne({ name }))
        return res.status(400).send({ error: "Company name already exists" });

      const company = await Company.create({ ...req.body, user: req.userId });
      return res.send({ company });
    } catch (err) {
      return res.status(400).send({ error: "Registration failed" });
    }
  }),
  //update company
  router.put("/:companyId", async (req, res) => {
    res.send({ ok: true, company: req.companyId });
  }),
  //delete company
  router.delete("/:companyId", async (req, res) => {
    res.send({ ok: true });
  }),
  (module.exports = app => app.use("/company", router));
