const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Disease = require('../models/Disease');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const Sale = require('../models/Sale');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy_analytics_db';

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
  'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
  'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara',
  'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'
];

const provinces = {
  'Colombo': 'Western', 'Gampaha': 'Western', 'Kalutara': 'Western',
  'Kandy': 'Central', 'Matale': 'Central', 'Nuwara Eliya': 'Central',
  'Galle': 'Southern', 'Matara': 'Southern', 'Hambantota': 'Southern',
  'Jaffna': 'Northern', 'Kilinochchi': 'Northern', 'Mannar': 'Northern',
  'Vavuniya': 'Northern', 'Mullaitivu': 'Northern', 'Batticaloa': 'Eastern', 'Ampara': 'Eastern',
  'Trincomalee': 'Eastern', 'Kurunegala': 'North Western', 'Puttalam': 'North Western',
  'Anuradhapura': 'North Central', 'Polonnaruwa': 'North Central',
  'Badulla': 'Uva', 'Monaragala': 'Uva', 'Ratnapura': 'Sabaragamuwa', 'Kegalle': 'Sabaragamuwa'
};

const diseaseData = [
  { name: 'Dengue Fever', code: 'DEN001', category: 'Infectious Disease', severity: 'High', isNotifiable: true, symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Rash'] },
  { name: 'Diabetes Mellitus', code: 'DIA001', category: 'Metabolic Disease', severity: 'High', isNotifiable: false, symptoms: ['Frequent urination', 'Excessive thirst', 'Fatigue'] },
  { name: 'Hypertension', code: 'HYP001', category: 'Cardiovascular Disease', severity: 'High', isNotifiable: false, symptoms: ['Headache', 'Dizziness', 'Chest pain'] },
  { name: 'Malaria', code: 'MAL001', category: 'Infectious Disease', severity: 'High', isNotifiable: true, symptoms: ['Fever', 'Chills', 'Sweating', 'Headache'] },
  { name: 'Tuberculosis', code: 'TUB001', category: 'Infectious Disease', severity: 'Critical', isNotifiable: true, symptoms: ['Persistent cough', 'Night sweats', 'Weight loss'] },
  { name: 'Asthma', code: 'AST001', category: 'Respiratory Disease', severity: 'Medium', isNotifiable: false, symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness'] },
  { name: 'Urinary Tract Infection', code: 'UTI001', category: 'Infectious Disease', severity: 'Medium', isNotifiable: false, symptoms: ['Painful urination', 'Frequent urination', 'Pelvic pain'] },
  { name: 'Common Cold & Flu', code: 'FLU001', category: 'Infectious Disease', severity: 'Low', isNotifiable: false, symptoms: ['Runny nose', 'Sore throat', 'Cough', 'Fever'] },
  { name: 'Gastroenteritis', code: 'GAS001', category: 'Gastrointestinal Disease', severity: 'Medium', isNotifiable: false, symptoms: ['Diarrhea', 'Vomiting', 'Stomach cramps'] },
  { name: 'Typhoid', code: 'TYP001', category: 'Infectious Disease', severity: 'High', isNotifiable: true, symptoms: ['Prolonged fever', 'Weakness', 'Abdominal pain'] },
  { name: 'Cardiac Disease', code: 'CAR001', category: 'Cardiovascular Disease', severity: 'Critical', isNotifiable: false, symptoms: ['Chest pain', 'Shortness of breath', 'Palpitations'] },
  { name: 'Leptospirosis', code: 'LEP001', category: 'Infectious Disease', severity: 'High', isNotifiable: true, symptoms: ['Fever', 'Muscle pain', 'Red eyes'] },
  { name: 'Depression', code: 'DEP001', category: 'Mental Health', severity: 'High', isNotifiable: false, symptoms: ['Persistent sadness', 'Loss of interest', 'Fatigue'] },
  { name: 'Skin Infection', code: 'SKI001', category: 'Skin Disease', severity: 'Low', isNotifiable: false, symptoms: ['Redness', 'Itching', 'Swelling'] },
  { name: 'Anemia', code: 'ANE001', category: 'Other', severity: 'Medium', isNotifiable: false, symptoms: ['Fatigue', 'Weakness', 'Pale skin'] }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Disease.deleteMany({}), Medicine.deleteMany({}),
      Pharmacy.deleteMany({}), Sale.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed Diseases
    const diseases = await Disease.insertMany(diseaseData);
    console.log(`✅ Seeded ${diseases.length} diseases`);

    const diseaseMap = {};
    diseases.forEach(d => { diseaseMap[d.code] = d._id; });

    // Seed Medicines
    const medicineData = [
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', brand: 'Panadol', category: 'Analgesic', type: 'Over-the-Counter (OTC)', unit: 'Tablet', price: 2.50, diseases: [diseaseMap['FLU001'], diseaseMap['DEN001']], manufacturer: 'GSK Lanka' },
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', brand: 'Glucophage', category: 'Antidiabetic', type: 'Prescription (Rx)', unit: 'Tablet', price: 8.00, diseases: [diseaseMap['DIA001']], manufacturer: 'Merck' },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', brand: 'Norvasc', category: 'Antihypertensive', type: 'Prescription (Rx)', unit: 'Tablet', price: 12.00, diseases: [diseaseMap['HYP001'], diseaseMap['CAR001']], manufacturer: 'Pfizer' },
      { name: 'Salbutamol Inhaler', genericName: 'Albuterol', brand: 'Ventolin', category: 'Bronchodilator', type: 'Prescription (Rx)', unit: 'Inhaler', price: 350.00, diseases: [diseaseMap['AST001']], manufacturer: 'GSK' },
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', brand: 'Amoxil', category: 'Antibiotic', type: 'Prescription (Rx)', unit: 'Capsule', price: 15.00, diseases: [diseaseMap['UTI001'], diseaseMap['SKI001']], manufacturer: 'Beximco' },
      { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin HCl', brand: 'Ciprobay', category: 'Antibiotic', type: 'Prescription (Rx)', unit: 'Tablet', price: 25.00, diseases: [diseaseMap['UTI001'], diseaseMap['TYP001']], manufacturer: 'Bayer' },
      { name: 'ORS Sachets', genericName: 'Oral Rehydration Salts', brand: 'Electral', category: 'Gastrointestinal', type: 'Over-the-Counter (OTC)', unit: 'Powder', price: 35.00, diseases: [diseaseMap['GAS001'], diseaseMap['DEN001']], manufacturer: 'Nicolas Piramal' },
      { name: 'Rifampicin 450mg', genericName: 'Rifampin', brand: 'Rimactane', category: 'Antibiotic', type: 'Prescription (Rx)', unit: 'Capsule', price: 85.00, diseases: [diseaseMap['TUB001']], manufacturer: 'Novartis' },
      { name: 'Chloroquine 250mg', genericName: 'Chloroquine Phosphate', brand: 'Aralen', category: 'Antiviral', type: 'Prescription (Rx)', unit: 'Tablet', price: 18.00, diseases: [diseaseMap['MAL001']], manufacturer: 'Sanofi' },
      { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', brand: 'Lipitor', category: 'Cardiovascular', type: 'Prescription (Rx)', unit: 'Tablet', price: 22.00, diseases: [diseaseMap['CAR001'], diseaseMap['HYP001']], manufacturer: 'Pfizer' },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', brand: 'Brufen', category: 'Analgesic', type: 'Over-the-Counter (OTC)', unit: 'Tablet', price: 5.00, diseases: [diseaseMap['FLU001']], manufacturer: 'Abbott' },
      { name: 'Doxycycline 100mg', genericName: 'Doxycycline Hyclate', brand: 'Vibramycin', category: 'Antibiotic', type: 'Prescription (Rx)', unit: 'Capsule', price: 30.00, diseases: [diseaseMap['LEP001'], diseaseMap['MAL001']], manufacturer: 'Pfizer' },
      { name: 'Sertraline 50mg', genericName: 'Sertraline HCl', brand: 'Zoloft', category: 'Psychiatric', type: 'Prescription (Rx)', unit: 'Tablet', price: 45.00, diseases: [diseaseMap['DEP001']], manufacturer: 'Pfizer' },
      { name: 'Ferrous Sulfate 200mg', genericName: 'Iron Sulfate', brand: 'Fefol', category: 'Nutritional Supplement', type: 'Over-the-Counter (OTC)', unit: 'Tablet', price: 6.00, diseases: [diseaseMap['ANE001']], manufacturer: 'SmithKline' },
      { name: 'Clotrimazole Cream', genericName: 'Clotrimazole', brand: 'Canesten', category: 'Antifungal', type: 'Over-the-Counter (OTC)', unit: 'Cream/Ointment (g)', price: 120.00, diseases: [diseaseMap['SKI001']], manufacturer: 'Bayer' },
      { name: 'Losartan 50mg', genericName: 'Losartan Potassium', brand: 'Cozaar', category: 'Antihypertensive', type: 'Prescription (Rx)', unit: 'Tablet', price: 18.00, diseases: [diseaseMap['HYP001']], manufacturer: 'Merck' },
      { name: 'Glibenclamide 5mg', genericName: 'Glyburide', brand: 'Daonil', category: 'Antidiabetic', type: 'Prescription (Rx)', unit: 'Tablet', price: 7.00, diseases: [diseaseMap['DIA001']], manufacturer: 'Sanofi' },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', brand: 'Zyrtec', category: 'Antihistamine', type: 'Over-the-Counter (OTC)', unit: 'Tablet', price: 8.00, diseases: [diseaseMap['FLU001'], diseaseMap['SKI001']], manufacturer: 'UCB' },
      { name: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', brand: 'Redoxon', category: 'Vitamins & Minerals', type: 'Over-the-Counter (OTC)', unit: 'Tablet', price: 4.00, diseases: [diseaseMap['FLU001'], diseaseMap['ANE001']], manufacturer: 'Bayer' },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', brand: 'Prilosec', category: 'Gastrointestinal', type: 'Prescription (Rx)', unit: 'Capsule', price: 14.00, diseases: [diseaseMap['GAS001']], manufacturer: 'AstraZeneca' }
    ];

    const medicines = await Medicine.insertMany(medicineData);
    console.log(`✅ Seeded ${medicines.length} medicines`);

    // Seed Pharmacies (one per district)
    const pharmacyDocs = districts.map((district, i) => ({
      name: `${district} Central Pharmacy`,
      registrationNo: `PH${String(i + 1).padStart(4, '0')}`,
      district,
      province: provinces[district],
      address: `No.${(i + 1) * 10}, Main Street, ${district}`,
      phone: `0${7 + (i % 3)}${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      email: `pharmacy${i + 1}@pharmasys.lk`,
      isActive: true
    }));

    const pharmacies = await Pharmacy.insertMany(pharmacyDocs);
    console.log(`✅ Seeded ${pharmacies.length} pharmacies`);

    // Seed Admin User
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@pharmasys.lk',
      password: 'Admin@2026',
      role: 'admin'
    });
    console.log(`✅ Admin user created: admin@pharmasys.lk / Admin@2026`);

    // Seed Pharmacy Users (one per district)
    // Must hash manually because insertMany() bypasses pre('save') hooks
    const hashedPassword = await bcrypt.hash('Pharmacy@2026', 12);
    const pharmacyUsers = districts.map((district, i) => ({
      name: `${district} Pharmacy Manager`,
      email: `${district.toLowerCase().replace(/\s+/g, '')}@pharmasys.lk`,
      password: hashedPassword,
      role: 'pharmacy',
      pharmacy: pharmacies[i]._id,
      isActive: true
    }));
    await User.insertMany(pharmacyUsers);

    // Seed Analyst User
    await User.create({
      name: 'Health Analyst',
      email: 'analyst@pharmasys.lk',
      password: 'Analyst@2026',
      role: 'analyst'
    });

    console.log(`✅ Demo users created`);
    console.log('\n📋 Pharmacy Login Credentials:');
    districts.forEach(district => {
      const email = `${district.toLowerCase().replace(/\s+/g, '')}@pharmasys.lk`;
      console.log(`  ${district.padEnd(16)}: ${email}  /  Pharmacy@2026`);
    });

    // Seed Sales Data (last 12 months)
    const salesData = [];
    const now = new Date();
    const weightedMedicines = [
      { med: medicines[0], weight: 15 }, // Paracetamol - most sold
      { med: medicines[1], weight: 12 }, // Metformin
      { med: medicines[2], weight: 10 }, // Amlodipine
      { med: medicines[10], weight: 9 }, // Ibuprofen
      { med: medicines[7], weight: 4 },  // Rifampicin
      { med: medicines[3], weight: 6 },  // Salbutamol
      { med: medicines[4], weight: 8 },  // Amoxicillin
      { med: medicines[6], weight: 5 },  // ORS
      { med: medicines[9], weight: 4 },  // Atorvastatin
      { med: medicines[18], weight: 7 }, // Vitamin C
    ];

    const totalWeight = weightedMedicines.reduce((s, m) => s + m.weight, 0);

    for (let month = 11; month >= 0; month--) {
      const salesPerMonth = Math.floor(Math.random() * 50) + 80;
      for (let s = 0; s < salesPerMonth; s++) {
        const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];
        const saleDate = new Date(now.getFullYear(), now.getMonth() - month, Math.floor(Math.random() * 28) + 1);

        // Weighted random medicine selection
        let rand = Math.random() * totalWeight;
        let selectedMed = weightedMedicines[0].med;
        for (const wm of weightedMedicines) {
          rand -= wm.weight;
          if (rand <= 0) { selectedMed = wm.med; break; }
        }

        const qty = Math.floor(Math.random() * 20) + 1;
        salesData.push({
          pharmacy: pharmacy._id,
          recordedBy: admin._id,
          medicine: selectedMed._id,
          quantity: qty,
          unitPrice: selectedMed.price,
          totalAmount: qty * selectedMed.price,
          saleDate,
          district: pharmacy.district,
          prescriptionRequired: selectedMed.type === 'Prescription (Rx)',
          prescriptionProvided: Math.random() > 0.2,
          patientAge: Math.floor(Math.random() * 70) + 10,
          patientGender: ['Male', 'Female', 'Not Specified'][Math.floor(Math.random() * 3)],
          batchNo: `BT${Math.floor(Math.random() * 9000) + 1000}`
        });
      }
    }

    await Sale.insertMany(salesData);
    console.log(`✅ Seeded ${salesData.length} sales records`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─'.repeat(50));
    console.log('🔑 Login Credentials:');
    console.log('  Admin:    admin@pharmasys.lk    / Admin@2026');
    console.log('  Pharmacy: colombo@pharmasys.lk  / Pharmacy@2026');
    console.log('  Analyst:  analyst@pharmasys.lk  / Analyst@2026');
    console.log('─'.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
    process.exit(1);
  }
}

seedDatabase();
