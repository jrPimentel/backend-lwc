const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Device = require("../models/device");
const router = express.Router();
const qr = require("qr-image");
const fs = require("fs");
router.use(authMiddleware);

router.post("/devices/qrcode", (req, res, next) => {
  // Get the text to generate QR code
  //let qr_txt = req.body.qr_text;
  let { devices } = req.body;

  devices.map(device => {
    // Generate QR Code from text
    let qr_png = qr.imageSync(device._id, { type: "png" });

    // Generate a name
    let qr_code_file_name = device._id + ".png";

    fs.writeFileSync(
      "./src/app/assets/qrcode" + qr_code_file_name,
      qr_png,
      err => {
        if (err) {
          console.log(err);
        }
      }
    );
  });

});

//Lista todos os devices
router.get("/devices", async (req, res) => {
  const devices = await Device.find().sort("-createdAt");
  return res.json(devices);
});
//add device
router.post("/devices/add", async (req, res) => {
  const { _id } = req.body;

  try {
    if (await Device.findOne({ _id }))
      return res.status(400).send({ error: "Device already exists" });

    const device = await Device.create(req.body);

    return res.send({ device });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" });
  }
});
module.exports = app => app.use(router);
