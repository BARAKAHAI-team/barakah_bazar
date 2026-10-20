const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('Testing Razorpay credentials:');
console.log('Key ID:', keyId);
console.log('Key Secret:', keySecret ? `${keySecret.slice(0, 4)}...${keySecret.slice(-4)}` : 'MISSING');

if (!keyId || !keySecret) {
  console.error('❌ Missing Razorpay credentials.');
  process.exit(1);
}

const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

async function testRazorpay() {
  try {
    console.log('\nCreating test order with Razorpay REST API...');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: 10000, // 100 INR in paise
        currency: 'INR',
        receipt: `rcpt_test_${Date.now()}`,
        notes: {
          store: 'Barakah Bazaar Test',
        },
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Razorpay authentication and order creation SUCCESSFUL!');
      console.log('Order ID:', data.id);
      console.log('Amount (paise):', data.amount);
      console.log('Currency:', data.currency);
      console.log('Status:', data.status);
      console.log('Receipt:', data.receipt);
    } else {
      console.error('❌ Razorpay order creation FAILED:', data);
    }
  } catch (err) {
    console.error('❌ Network / Request error:', err);
  }
}

testRazorpay();
