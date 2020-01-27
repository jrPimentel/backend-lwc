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
});
//Selecionar uma compania.
router.get("/:companyId", async (req, res) => {
  const { name } = req.body;
  const showCompanies = await Company.findOne(name);
  console.log(showCompanies);
  return res.json(showCompanies);
});

//add company
router.post("/add", async (req, res) => {
  const { name } = req.body;
  try {
    // if(await User.findOne({ accRoot: false })) return res.status(400).send({ error: 'User not a root'});
    if (await Company.findOne({ name }))
      return res.status(400).send({ error: "Company name already exists" });

    const company = await Company.create({ ...req.body, user: req.userId });
    const companies = await Company.find().sort("name");

    return res.send({ company, companies });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});

//update company
router.put("/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    if (await Company.find({ _id: companyId })) {
      // const company = await Company.findOneAndUpdate({ _id: companyId }, req.body, {
      //   returnNewDocument: true
      // });
      await Company.updateOne({ _id: companyId }, req.body);
      const company = await Company.find({ _id: companyId });
      const companies = await Company.find().sort("name");

      res.send({ success: true, company, companies });
    } else {
      res.status(400).send({ success: false, error: "Company not found" });
    }
  } catch (err) {
    res.status(400).send({ success: false, error: "Error when updating company" });
  }
});

//delete company
router.delete("/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    if (await Company.find({ _id: companyId })) {
      await Company.findOneAndDelete({ _id: companyId });
      const companies = await Company.find().sort("name");

      return res.send({ success: true, companies });
    } else {
      return res.status(400).send({ success: false, error: "Company not found" });
    }
  } catch (err) {
    return res.status(400).send({ success: false, error: "Error when deleting company" });
  }
  res.send({ ok: true });
});

module.exports = app => app.use("/company", router);
