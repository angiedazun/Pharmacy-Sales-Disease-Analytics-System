const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true
  },
  registrationNo: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    enum: [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
      'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
      'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
      'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
      'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
    ]
  },
  province: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  licenseExpiry: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
