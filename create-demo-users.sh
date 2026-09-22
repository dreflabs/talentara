#!/bin/bash

# ========================================
# TALENTARA - Create Demo Users Script
# ========================================
# This script creates demo users via API

API_URL="http://localhost:3000"

echo "🎯 Creating TALENTARA Demo Users..."
echo ""

# ========================================
# 1. Create Talent Demo User
# ========================================
echo "📝 Creating Talent Demo User..."
echo "   Email: talent@demo.com"
echo "   Password: Demo1234!"
echo ""

TALENT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "talent@demo.com",
    "password": "Demo1234!",
    "full_name": "Demo Talent",
    "phone": "081234567890",
    "role": "talent"
  }')

echo "Response: $TALENT_RESPONSE"
echo ""

# ========================================
# 2. Create Client Demo User
# ========================================
echo "📝 Creating Client Demo User..."
echo "   Email: client@demo.com"
echo "   Password: Demo1234!"
echo ""

CLIENT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@demo.com",
    "password": "Demo1234!",
    "full_name": "Demo Company",
    "phone": "081234567891",
    "role": "client"
  }')

echo "Response: $CLIENT_RESPONSE"
echo ""

# ========================================
# 3. Test Login - Talent
# ========================================
echo "🔐 Testing Talent Login..."
TALENT_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/talent_cookies.txt \
  -d '{
    "email": "talent@demo.com",
    "password": "Demo1234!"
  }')

echo "Response: $TALENT_LOGIN"
echo ""

# ========================================
# 4. Test Login - Client
# ========================================
echo "🔐 Testing Client Login..."
CLIENT_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/client_cookies.txt \
  -d '{
    "email": "client@demo.com",
    "password": "Demo1234!"
  }')

echo "Response: $CLIENT_LOGIN"
echo ""

# ========================================
# Summary
# ========================================
echo "✅ Demo Users Created!"
echo ""
echo "==========================================
DEMO USER CREDENTIALS
==========================================

1. TALENT ACCOUNT
   📧 Email: talent@demo.com
   🔑 Password: Demo1234!
   🎭 Role: Talent (SPG/Usher)

2. CLIENT ACCOUNT
   📧 Email: client@demo.com
   🔑 Password: Demo1234!
   🎭 Role: Client (Company)

==========================================
QUICK ACCESS
==========================================

🌐 Login Page: $API_URL/login
🏠 Talent Dashboard: $API_URL/dashboard
💼 Jobs Page: $API_URL/jobs
📋 Applications: $API_URL/applications

==========================================
"

echo "🎉 Setup complete! You can now login with the credentials above."
