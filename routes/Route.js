// signupRoutes.js
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import Measurement from '../models/MeasurementModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const mediaFolderPath = join(__dirname, '../media');


await fs.mkdir(mediaFolderPath, { recursive: true });


// route for post request 
router.post('/newMeasurement', upload.single('image'), async (req, res) => {
  try {
    const requiredFields = ['productName', 'description', 'user_id'];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `The field '${field}' must not be empty.` });
      }
    }


    const uniqueFilename = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${req.file.originalname}`;
    const imagePath = join(mediaFolderPath, uniqueFilename);

    // Write the image data to the file
    await fs.writeFile(imagePath, req.file.buffer);

    const newMeasurement = new Measurement({
      productName: req.body.productName,
      description: req.body.description,
      user_id: req.body.user_id,
      imageUrl: imagePath,
      imagebase64: req.file.buffer.toString('base64'),
    });

    await newMeasurement.save();

    res.status(201).json({ message: 'Measurement added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//route for get Measurement 
router.get('/getMeasurements', async (req, res) => {
  try {
    const measurements = await Measurement.find();
    res.status(200).json({ measurements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// route for getMeasurement through user_id 
router.get('/measurementByUserId', async (req, res) => {
  try {
    const {user_id }= req.query;

    // Retrieve measurements for the specified user_id
    const measurements = await Measurement.find({ user_id });

    if (!measurements || measurements.length === 0) {
      return res.status(404).json({ message: 'No measurements found for the given user_id.' });
    }

    res.status(200).json({ measurements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//route for delete 
router.delete('/deleteMeasurementByUserId', async (req, res) => {
  try {
    const { user_id } = req.query;

    // Find and delete measurements by user_id
    const deletedMeasurements = await Measurement.deleteMany({ user_id });

    if (!deletedMeasurements || deletedMeasurements.deletedCount === 0) {
      return res.status(404).json({ message: 'No measurements found for the given user_id.' });
    }

    res.status(200).json({ message: 'Measurements deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// route  update request 

router.put('/updateMeasurementByUserId', upload.single('image'), async (req, res) => {
  try {
    const { user_id } = req.query;
    const { productName, description } = req.body;

    // Check if required fields are provided
    if (!productName || !description) {
      return res.status(400).json({ error: 'productName and description are required fields.' });
    }

    // Find the measurements by user_id
    const existingMeasurement = await Measurement.findOne({ user_id });

    if (!existingMeasurement) {
      return res.status(404).json({ message: 'Measurements not found for the given user_id.' });
    }

    // Update the fields
    existingMeasurement.productName = productName;
    existingMeasurement.description = description;

    // If a new image is provided, update the image
    if (req.file) {
      const uniqueFilename = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${req.file.originalname}`;
      const imagePath = join(mediaFolderPath, uniqueFilename);

      // Write the new image data to the file
      await fs.writeFile(imagePath, req.file.buffer);

      existingMeasurement.imageUrl = imagePath;
      existingMeasurement.imagebase64 = req.file.buffer.toString('base64');
    }

    // Save the updated measurement
    await existingMeasurement.save();

    res.status(200).json({ message: 'Measurement updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



export default router;
