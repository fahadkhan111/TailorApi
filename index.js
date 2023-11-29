// app.js or index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import signupRouter from './routes/Route.js';

import { PORT, mongoDBURL } from './config.js';
const app = express();

// Middleware for parsing request body
app.use(express.json());

// Middleware for handling CORS POLICY
app.use(cors());

// Use the signup router
app.use('/api', signupRouter);

// MongoDB connection
mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
