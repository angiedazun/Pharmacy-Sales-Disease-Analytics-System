const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Disease name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: [
      'Infectious Disease', 'Chronic Disease', 'Respiratory Disease',
      'Cardiovascular Disease', 'Neurological Disorder', 'Metabolic Disease',
      'Gastrointestinal Disease', 'Mental Health', 'Skin Disease',
      'Musculoskeletal', 'Endocrine Disorder', 'Other'
    ],
    default: 'Other'
  },
  description: {
    type: String
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  symptoms: [String],
  isNotifiable: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Disease', diseaseSchema);
