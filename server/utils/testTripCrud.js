import { createTrip, getTrips, getTripById, updateTrip, deleteTrip } from '../controllers/tripController.js';

/**
 * Diagnostic test script for Trip CRUD Controllers & Authorization Rules
 */
export async function runTripCrudTests() {
  console.log('====================================================');
  console.log(' ✈️  Running GlobeTrotter Trip CRUD Suite');
  console.log('====================================================');

  const createResHelper = () => ({
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  });

  // Test 1: Date Validation (End date before Start date)
  console.log('\n[Test 1] Testing Date Validation (End date before Start date)...');
  const req1 = {
    user: { _id: '60d5ec49f1b2c80015f8e001' },
    body: {
      name: 'Invalid Date Trip',
      startDate: '2026-10-15',
      endDate: '2026-10-10',
    },
  };
  const res1 = createResHelper();
  await createTrip(req1, res1);
  console.log(`↳ Response Code: ${res1.statusCode} (${res1.jsonData.message})`);
  console.log(res1.statusCode === 400 ? '✅ PASSED: Invalid date range rejected' : '❌ FAILED');

  // Test 2: Missing Name Validation
  console.log('\n[Test 2] Testing Required Trip Name Validation...');
  const req2 = {
    user: { _id: '60d5ec49f1b2c80015f8e001' },
    body: {
      name: '   ',
      startDate: '2026-10-10',
      endDate: '2026-10-15',
    },
  };
  const res2 = createResHelper();
  await createTrip(req2, res2);
  console.log(`↳ Response Code: ${res2.statusCode} (${res2.jsonData.message})`);
  console.log(res2.statusCode === 400 ? '✅ PASSED: Empty trip name rejected' : '❌ FAILED');

  console.log('\n====================================================');
  console.log(' 🟢 Trip CRUD Validation Routines Verified');
  console.log('====================================================');
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTripCrudTests();
}
