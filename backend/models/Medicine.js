const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Antibiotic', 'Analgesic', 'Antipyretic', 'Antidiabetic',
      'Antihypertensive', 'Antifungal', 'Antihistamine', 'Antiviral',
      'Bronchodilator', 'Cardiovascular', 'Dermatological', 'Gastrointestinal',
      'Hormonal', 'Neurological', 'Nutritional Supplement', 'Ophthalmic',
      'Psychiatric', 'Vaccine', 'Vitamins & Minerals', 'Other'
    ],
    default: 'Other'
  },
  type: {
    type: String,
    enum: ['Prescription (Rx)', 'Over-the-Counter (OTC)', 'Controlled Substance'],
    default: 'Over-the-Counter (OTC)'
  },
  unit: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup (ml)', 'Injection (vial)', 'Cream/Ointment (g)', 'Drops', 'Inhaler', 'Patch', 'Powder', 'Other'],
    default: 'Tablet'
  },
  diseases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disease'
  }],
  description: String,
  manufacturer: String,
  price: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
