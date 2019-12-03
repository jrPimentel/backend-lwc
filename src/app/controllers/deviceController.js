const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Device = require("../models/device");
const router = express.Router();
const qr = require("qr-image");
const fs = require("fs");
const PDFDocument = require("pdfkit");
router.use(authMiddleware);

router.post("/devices/qrcode", (req, res, next) => {
  // Get the text to generate QR code
  let { devices } = req.body;

  // Generate a QR Code for each device
  devices.map(device => {
    // Generate QR Code from text
    let qr_png = qr.imageSync(device._id, { type: "png", size: 10, ec_level: "Q", margin: 2 });

    // Generate a name
    let qr_code_file_name = device._id + ".png";

    // Save the QR Code as a .png
    fs.writeFileSync("./src/app/assets/qrcode" + qr_code_file_name, qr_png, err => {
      if (err) {
        console.log(err);
      }
    });
  });

  // Create a document
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("output.pdf"));

  const { width } = doc.page;

  //Add lanwork logo
  doc.image("src/app/assets/lanwork.png", 10, 10, { width: 100 });
  doc.image("src/app/assets/lanwork.png", width - 110, 10, { width: 100 });

  doc.image("qrcode123.png", 0, 30, { fit: [200, 200] }).text("QRCode 123", 30, 210);

  doc.image("qrcode123.png", 205, 30, { fit: [200, 200] }).text("QRCode 123", 235, 210);

  doc.image("qrcode123.png", 410, 30, { fit: [200, 200] }).text("QRCode 123", 440, 210);

  doc.image("qrcode123.png", 0, 240, { fit: [200, 200] }).text("QRCode 123", 30, 420);

  /*devices.map(device => {
    doc.image(`src/app/assets/qrcode${device._id}.png`, { fit: [250, 250] });
  });*/

  // Finalize PDF file
  doc.end();

  res.send({ status: "ok" });
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
