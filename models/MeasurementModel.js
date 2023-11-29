import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagebase64: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Measurement = mongoose.model('Measurement', measurementSchema);

export default Measurement;
