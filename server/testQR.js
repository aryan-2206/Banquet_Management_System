require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const qrService = require('./services/qrService');

async function runTest() {
  console.log('--- Checking QR Service ---');

  // 1. Connect to Database using existing config
  await connectDB();
  console.log('Database connected.\n');

  try {
    // 2. Generate a QR Code for a dummy guest
    console.log('1. Generating QR Code...');
    const generateResult = await qrService.generateQRCode({
      entityType: 'Guest',
      data: { name: 'Test Guest', email: 'test@example.com' }
    });
    
    console.log('QR Code Generated Successfully!');
    console.log(`Unique ID (qrId): ${generateResult.qrId}`);
    console.log(`Base64 Image Data (truncated): ${generateResult.qrCodeImage.substring(0, 50)}...\n`);

    // 3. First Verification Scan (Should Succeed)
    console.log('2. Simulating First Scan (Verification)...');
    const firstScan = await qrService.verifyQRCode(generateResult.qrId);
    console.log('First Scan Result:', firstScan);
    console.log();

    // 4. Second Verification Scan (Should Fail as already scanned)
    console.log('3. Simulating Second Scan (Duplicate Check)...');
    const secondScan = await qrService.verifyQRCode(generateResult.qrId);
    console.log('Second Scan Result:', secondScan);
    console.log();

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    // Clean up
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

runTest();
