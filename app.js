const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware to parse URL-encoded and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/vehicle_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Define the Vehicle model
const Vehicle = mongoose.model('Vehicle', {
  name: String,
  email: String,
  phoneNumber: String,
  address: String,
  vehicleBrand: String,
  chassisNumber: String,
});

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'ETHEREAL',
  auth: {
    user: 'your_email@gmail.com',  // Replace with your email address
    pass: 'your_password',         // Replace with your email password or app password
  },
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/submit', async (req, res) => {
  try {
    const { name, email, phoneNumber, address, vehicleBrand, chassisNumber } = req.body;

    // Save to MongoDB
    const newVehicle = new Vehicle({
      name,
      email,
      phoneNumber,
      address,
      vehicleBrand,
      chassisNumber,
    });
    await newVehicle.save();

    // Generate PDF
    const html = `
      <h1>Vehicle Details</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Vehicle Brand:</strong> ${vehicleBrand}</p>
      <p><strong>Chassis Number:</strong> ${chassisNumber}</p>
    `;
    const pdfPath = path.join(__dirname, 'public', 'documents', `${name}_details.pdf`);

    pdf.create(html).toFile(pdfPath, (err, _) => {
      if (err) throw err;
      console.log('PDF created successfully');
      
      // Send Email with PDF Attachment
      const mailOptions = {
        from: 'gordon.smith84@ethereal.email',          // Replace with your email address
        to: email,                            // Send email to the submitted email address
        subject: 'Vehicle Details',
        html: '<p>Find attached the details of your vehicle.</p>',
        attachments: [{ filename: `${name}_details.pdf`, path: pdfPath }],
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send('Error sending email');
        } else {
          console.log('Email sent: ' + info.response);
          res.send('Details submitted successfully and email sent!');
        }
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting details');
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
