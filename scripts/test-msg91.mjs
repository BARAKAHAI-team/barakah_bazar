/**
 * MSG91 Test Script
 * Usage: node scripts/test-msg91.mjs
 */
import fs from 'fs';
import path from 'path';

// Read .env.local if not already in process.env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const SENDER_ID = process.env.MSG91_SENDER_ID || 'BARAKA';
const PHONE = process.env.TEST_PHONE || '917975962858';
const DUMMY_OTP = '123456';

console.log('--- MSG91 Test Configuration ---');
console.log(`Target Phone: ${PHONE}`);
console.log(`Dummy OTP: ${DUMMY_OTP}`);
console.log(`Sender ID (Header): ${SENDER_ID}`);
console.log(`Template ID: ${TEMPLATE_ID || '(Not provided yet in .env.local)'}`);
console.log(`Auth Key: ${AUTH_KEY ? AUTH_KEY.slice(0, 6) + '...' : '(Not provided yet in .env.local)'}`);
console.log('--------------------------------\n');

if (!AUTH_KEY || !TEMPLATE_ID) {
  console.error('ERROR: Please add MSG91_AUTH_KEY and MSG91_TEMPLATE_ID to .env.local first.');
  console.log('\nExample .env.local entries:');
  console.log('MSG91_AUTH_KEY=your_msg91_auth_key_here');
  console.log('MSG91_TEMPLATE_ID=your_msg91_template_id_here');
  console.log('MSG91_SENDER_ID=BARAKA');
  process.exit(1);
}

async function testSendOtp() {
  console.log(`Sending dummy OTP (${DUMMY_OTP}) to ${PHONE} via MSG91 OTP API...`);

  try {
    // 1. Try MSG91 OTP API endpoint (passing custom OTP)
    const url = new URL('https://control.msg91.com/api/v5/otp');
    url.searchParams.append('template_id', TEMPLATE_ID);
    url.searchParams.append('mobile', PHONE);
    url.searchParams.append('authkey', AUTH_KEY);
    url.searchParams.append('otp', DUMMY_OTP);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));

    if (response.ok && data.type === 'success') {
      console.log('\n✅ Success! SMS OTP sent successfully to', PHONE);
    } else {
      console.log('\n⚠️ MSG91 returned:', data.message || data);
    }
  } catch (err) {
    console.error('Network or Execution Error:', err);
  }
}

testSendOtp();
