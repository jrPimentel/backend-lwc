const express = require("express");
const router = express.Router();
const qr = require("qr-image");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const jwt = require("jsonwebtoken");
const secretKey = require("../../config/auth").secret;

//Models
const Device = require("../models/device");
//Middleware
const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

const createUniqueIdPDF = () =>
  "_" +
  Math.random()
    .toString(36)
    .substr(2, 9);

const getDevices = async authorization => {
  const token = authorization.replace("Bearer ", "");
  let devices = [];

  //Check if user is admin
  const { admin, user } = jwt.verify(token, secretKey);
  if (admin) {
    devices = await Device.find().sort("-createdAt");
  } else {
    devices = await Device.find({ company: user.company }).sort("-createdAt");
  }

  return devices;
};

//Generate and send a PDF with the QR Codes
router.post("/devices/qrcode", (req, res) => {
  //TODO: Delete PDFs
  // Get the text to generate QR code
  let { devices } = req.body;
  const assetsPath = "src/app/assets";

  // Generate a QR Code for each device
  devices.map(device => {
    let qr_png = qr.imageSync(device._id, { type: "png", size: 7, ec_level: "Q" }); // Generate QR Code from text
    let qr_code_file_name = device._id + ".png"; // Generate a name

    // Save the QR Code as a .png
    fs.writeFileSync(`${assetsPath}/qrcode${qr_code_file_name}`, qr_png, err => {
      if (err) {
        console.log(err);
      }
    });
  });

  // Create a document
  const doc = new PDFDocument();
  const docName = `output${createUniqueIdPDF()}`;
  doc.pipe(fs.createWriteStream(`${assetsPath}/pdfs/${docName}.pdf`));
  res.setHeader("Content-disposition", 'attachment; filename="output.pdf"');
  res.setHeader("Content-type", "application/pdf");

  const { width, height } = doc.page; // Get page's width
  const lanworkLogoWidth = 150; // Default Lanwork logo width

  //Positioning
  let xImg = 0;
  let yImg = 35;
  let yTxt = 220;

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
      .text(device.name, xImg + 25, yTxt);

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
      yImg = 35;
      yTxt = 220;
    }
  });

  // Finalize PDF file
  doc.pipe(res);
  doc.end();

  try {
    // Delete qrcode images
    devices.map(device => {
      fs.unlinkSync(`${assetsPath}/qrcode${device._id}.png`);
    });

    // Delete pdf
    //fs.unlinkSync(`${assetsPath}/pdfs/${docName}.pdf`);
  } catch (err) {
    return res
      .status(400)
      .send({ success: false, error: "Error when deleting a QR Code image or the PDF" });
  }
});

//Lista todos os devices
router.get("/devices", async (req, res) => {
  const devices = await Device.find().sort("-createdAt");
  return res.json(devices);
});

//TODO: Get devices by company
//List
router.get("/devices/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const devices = await Device.find({ company: companyId }).sort("name");
  return res.json(devices);
});

//add device
router.post("/devices/add", async (req, res) => {
  const { _id } = req.body;
  const { authorization } = req.headers;

  try {
    if (await Device.findOne({ _id }))
      return res.status(400).send({ error: "Device already exists" });

    const device = await Device.create(req.body);

    return res.send({ device, devices: await getDevices(authorization) });
  } catch (err) {
    console.log(err);

    return res.status(400).send({ error: "Registration failed" });
  }
});

//Delete device
router.delete("/devices/:deviceId", async (req, res) => {
  const { deviceId } = req.params;

  try {
    if (await Device.findOne({ _id: deviceId })) {
      await Device.findOneAndDelete({ _id: deviceId });
      const devices = await Device.find().sort("-createdAt");

      return res.send({ success: true, devices });
    } else {
      return res.status(400).send({ success: false, error: "Device not found" });
    }
  } catch (err) {
    return res.status(400).send({ success: false, error: "Error when deleting device" });
  }
});

module.exports = app => app.use(router);
