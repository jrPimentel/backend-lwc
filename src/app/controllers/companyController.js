const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Company = require("../models/company");
const User = require("../models/user");
const router = express.Router();

router.use(authMiddleware);

//Listar todas.
router.get("/", async (req, res) => {
  const listCompanies = await Company.find().sort("name");

  const promises = listCompanies.map(async company => {
    const { email } = await User.findOne({ _id: company.rootUser });
    const compJson = company.toJSON();
    compJson.email = email;

    return compJson;
  });

  return res.json(await Promise.all(promises));
  // return res.status(200).send({ success: true, companies: await Promise.all(promises) });
});
//Selecionar uma compania.
router.get("/:companyId", async (req, res) => {
  const { name } = req.body;
  const showCompanies = await Company.findOne(name);
  console.log(showCompanies);
  return res.json(showCompanies);
});

//add company
router.post("/", async (req, res) => {
  const { email, name, location } = req.body;

  try {
    // Check if the email is already been used another user
    if (await User.findOne({ email }))
      return res.status(400).send({ success: false, error: "Email already in use" });

    // Create the company without the user
    await Company.create({ name, location });

    //Create the user
    const user = await User.create({
      name: `Admin ${name}`,
      email,
      password: " ",
      accRoot: true,
      company: company._id
    });

    // Add the user id to the company
    const company = await Company.updateOne(
      { _id: company._id },
      { name, location, rootUser: user._id }
    );
    const companies = await Company.find().sort("name");

    return res.send({ success: true, company, companies });
  } catch (err) {
    console.log(err);

    return res.status(400).send({ success: false, error: "Registration failed" });
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
//TODO: Also delete the user
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
