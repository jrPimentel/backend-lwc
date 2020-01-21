const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Device = require("../models/device");
const router = express.Router();
const qr = require("qr-image");
const fs = require("fs");
const PDFDocument = require("pdfkit");

router.use(authMiddleware);

router.post("/devices/qrcode", (req, res) => {
  // Get the text to generate QR code
  let { devices } = req.body;

  // Generate a QR Code for each device
  devices.map(device => {
    let qr_png = qr.imageSync(device._id, { type: "png", size: 7, ec_level: "Q" }); // Generate QR Code from text
    let qr_code_file_name = device._id + ".png"; // Generate a name

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
  res.setHeader("Content-disposition", 'attachment; filename="output.pdf"');
  res.setHeader("Content-type", "application/pdf");

  const { width, height } = doc.page; // Get page's width
  const lanworkLogoWidth = 150; // Default Lanwork logo width
  const assetsPath = "src/app/assets";

  //Positioning
  let xImg = 0;
  let yImg = 30;
  let yTxt = 210;

  // Function to add Lanwork logo on the borders
  const addLogo = () => {
    //Top left and Top right
    doc.image(`${assetsPath}/lanwork.png`, 10, 10, { width: lanworkLogoWidth });
    doc.image(`${assetsPath}/lanwork.png`, width - lanworkLogoWidth - 10, 10, {
      width: lanworkLogoWidth
    });

    //Bottom left and Bottom right
    doc.image(`${assetsPath}/lanwork.png`, 10, height - 40, { width: lanworkLogoWidth });
    doc.image(`${assetsPath}/lanwork.png`, width - lanworkLogoWidth - 10, height - 40, {
      width: lanworkLogoWidth
    });
  };

  //Add Lanwork logo
  addLogo();

  /**
   * Exemplo de como é cada passagem do loop
   * doc.image("qrcode123.png", 0, 30, { fit: [200, 200] }).text("QRCode 123", 30, 210);
   * doc.image("qrcode123.png", 205, 30, { fit: [200, 200] }).text("QRCode 123", 235, 210);
   * doc.image("qrcode123.png", 410, 30, { fit: [200, 200] }).text("QRCode 123", 440, 210);
   * doc.image("qrcode123.png", 0, 240, { fit: [200, 200] }).text("QRCode 123", 30, 420);
   */
  devices.map((device, index) => {
    doc
      .image(`${assetsPath}/qrcode${device._id}.png`, xImg, yImg, { fit: [200, 200] })
      .text(device.name, xImg + 30, yTxt);

    xImg += 205;

    // If gets to 3 qrs per line
    if ((index + 1) % 3 === 0) {
      yImg += 210;
      yTxt += 210;
      xImg = 0;
    }

    // If gets to 9 qrs per page
    if ((index + 1) % 9 === 0) {
      //Add new page with the logos
      doc.addPage();
      addLogo();

      //Reset values
      xImg = 0;
      yImg = 30;
      yTxt = 210;
    }
  });

  // Finalize PDF file
  doc.pipe(res);
  doc.end();
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
