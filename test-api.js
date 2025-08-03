// Script simple pour tester l'API
const https = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/analytics/dashboard',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:3001',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('API Response:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
