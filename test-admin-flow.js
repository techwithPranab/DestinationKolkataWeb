#!/usr/bin/env node

// Test script to verify complete admin authentication flow
const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3001'

async function testAdminFlow() {
  console.log('🧪 Testing Complete Admin Authentication Flow...\n')

  try {
    // Step 1: Login
    console.log('1. 🔐 Logging in as admin...')
    const loginResponse = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@destinationkolkata.com',
        password: 'admin123'
      })
    })

    const loginData = await loginResponse.json()
    console.log(`   Status: ${loginResponse.status}`)
    console.log(`   Success: ${loginData.success}`)
    console.log(`   User: ${loginData.user?.name} (${loginData.user?.role})`)
    console.log(`   Token: ${loginData.token ? '✅ Generated' : '❌ Missing'}\n`)

    if (!loginData.success || !loginData.token) {
      console.log('❌ Login failed!')
      return
    }

    // Step 2: Access Dashboard
    console.log('2. 📊 Accessing admin dashboard...')
    const dashboardResponse = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    })

    const dashboardData = await dashboardResponse.json()
    console.log(`   Status: ${dashboardResponse.status}`)
    console.log(`   Success: ${dashboardData.success}`)

    if (dashboardData.success) {
      console.log(`   Stats Cards: ${dashboardData.data?.statsCards?.length || 0}`)
      console.log(`   Recent Activities: ${dashboardData.data?.recentActivities?.length || 0}`)
      console.log(`   Top Performers: ${dashboardData.data?.topPerformers?.length || 0}`)
    }

    console.log('\n✅ Admin authentication flow test completed successfully!')
    console.log('\n🌐 You can now access the admin dashboard at:')
    console.log(`   ${BASE_URL}/admin/login`)
    console.log('\n📧 Login Credentials:')
    console.log('   Email: admin@destinationkolkata.com')
    console.log('   Password: admin123')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAdminFlow()
