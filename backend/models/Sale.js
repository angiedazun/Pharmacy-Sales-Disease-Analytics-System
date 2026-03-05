const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Pharmacy is required']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: [true, 'Medicine is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: 0
  },
  totalAmount: {
    type: Number
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  prescriptionProvided: {
    type: Boolean,
    default: false
  },
  patientAge: {
    type: Number,
    min: 0,
    max: 120
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Not Specified'],
    default: 'Not Specified'
  },
  batchNo: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  district: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Auto-calc totalAmount
saleSchema.pre('save', function (next) {
  this.totalAmount = this.quantity * this.unitPrice;
  next();
});

// Index for fast analytics queries
saleSchema.index({ saleDate: -1 });
saleSchema.index({ medicine: 1, saleDate: -1 });
saleSchema.index({ pharmacy: 1, saleDate: -1 });
saleSchema.index({ district: 1 });

module.exports = mongoose.model('Sale', saleSchema);
