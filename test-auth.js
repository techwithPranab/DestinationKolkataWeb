#!/usr/bin/env node

// Simple test script to verify authentication system
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testAuthentication() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Try to access protected customer API without token
    console.log('1. Testing protected API without authentication...');
    const response1 = await fetch(`${BASE_URL}/api/customer/submissions`);
    console.log(`   Status: ${response1.status}`);
    const data1 = await response1.json();
    console.log(`   Response: ${JSON.stringify(data1, null, 2)}\n`);

    // Test 2: Try to login (assuming we have test credentials)
    console.log('2. Testing login endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@destinationkolkata.com', // Admin credentials
        password: 'admin123'
      })
    });
    console.log(`   Login Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Login Response: ${JSON.stringify(loginData, null, 2)}\n`);

    if (loginData.token) {
      // Test 3: Try to access protected API with token
      console.log('3. Testing protected API with authentication token...');
      const response2 = await fetch(`${BASE_URL}/api/customer/submissions`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      console.log(`   Status: ${response2.status}`);
      const data2 = await response2.json();
      console.log(`   Response: ${JSON.stringify(data2, null, 2)}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthentication();
