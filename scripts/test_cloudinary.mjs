import crypto from 'crypto';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Testing Cloudinary credentials:');
console.log('Cloud Name:', cloudName);
console.log('API Key:', apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : 'MISSING');
console.log('API Secret:', apiSecret ? `${apiSecret.slice(0, 4)}...${apiSecret.slice(-4)}` : 'MISSING');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary configuration in environment.');
  process.exit(1);
}

const timestamp = Math.round(new Date().getTime() / 1000);
const folder = 'barakah_products';

const paramsToSign = {
  folder,
  timestamp,
};

const sortedKeys = Object.keys(paramsToSign).sort();
const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

console.log('\nGenerated signature:', signature);
console.log('Timestamp:', timestamp);

// Create a small 1x1 test PNG image in base64 (Data URI)
const testPixelBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const formData = new FormData();
formData.append('file', testPixelBase64);
formData.append('api_key', apiKey);
formData.append('timestamp', String(timestamp));
formData.append('signature', signature);
formData.append('folder', folder);

console.log('\nSending test upload request to Cloudinary API...');
// Test 2: Unsigned upload with upload_preset
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'barakah_products';
console.log('\nTesting upload with upload_preset:', uploadPreset);

const presetFormData = new FormData();
presetFormData.append('file', testPixelBase64);
presetFormData.append('upload_preset', uploadPreset);

try {
  const res2 = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: presetFormData,
  });
  const data2 = await res2.json();
  if (res2.ok) {
    console.log('✅ Cloudinary unsigned upload with preset SUCCESSFUL!');
    console.log('Public ID:', data2.public_id);
    console.log('Secure URL:', data2.secure_url);
  } else {
    console.error('❌ Cloudinary unsigned upload FAILED:', data2);
  }
} catch (err) {
  console.error('❌ Unsigned test error:', err);
}

// Test 3: Signed upload with upload_preset included
console.log('\nTesting signed upload with upload_preset included in signature...');
const paramsWithPreset = {
  folder,
  timestamp,
  upload_preset: uploadPreset,
};
const sortedKeys3 = Object.keys(paramsWithPreset).sort();
const stringToSign3 = sortedKeys3.map((k) => `${k}=${paramsWithPreset[k]}`).join('&') + apiSecret;
const signature3 = crypto.createHash('sha1').update(stringToSign3).digest('hex');

const signedPresetForm = new FormData();
signedPresetForm.append('file', testPixelBase64);
signedPresetForm.append('api_key', apiKey);
signedPresetForm.append('timestamp', String(timestamp));
signedPresetForm.append('signature', signature3);
signedPresetForm.append('folder', folder);
signedPresetForm.append('upload_preset', uploadPreset);

try {
  const res3 = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: signedPresetForm,
  });
  const data3 = await res3.json();
  if (res3.ok) {
    console.log('✅ Cloudinary signed upload with preset SUCCESSFUL!');
    console.log('Public ID:', data3.public_id);
    console.log('Secure URL:', data3.secure_url);
  } else {
    console.error('❌ Cloudinary signed upload with preset FAILED:', data3);
  }
} catch (err) {
  console.error('❌ Signed preset test error:', err);
}

