#!/bin/bash

# ========================================
# TALENTARA - Complete Demo Environment Setup
# ========================================
# This script creates:
# 1. Admin user
# 2. Demo talent users (3 users)
# 3. Demo client users (2 companies)
# 4. Sample job postings (if needed)

set -e

API_URL="${API_URL:-http://localhost:3000}"

echo "========================================="
echo "🚀 TALENTARA - Demo Environment Setup"
echo "========================================="
echo ""
echo "This will create:"
echo "  • 1 Admin user"
echo "  • 3 Talent demo users"
echo "  • 2 Client demo users"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create user
create_user() {
    local email=$1
    local password=$2
    local name=$3
    local phone=$4
    local role=$5

    echo -e "${YELLOW}Creating $role: $email${NC}"

    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/auth/register" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$email\",
        \"password\": \"$password\",
        \"full_name\": \"$name\",
        \"phone\": \"$phone\",
        \"role\": \"$role\"
      }")

    HTTP_CODE=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_CODE://')

    if [ "$HTTP_CODE" == "201" ] || [ "$HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ Success: $email${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed: $email (HTTP $HTTP_CODE)${NC}"
        return 1
    fi
}

echo ""
echo "========================================="
echo "👤 Creating Users..."
echo "========================================="
echo ""

# Create Admin
create_user "admin@talentara.com" "Admin123!@#" "Super Admin" "081234567000" "client"

# Create Talents
create_user "talent1@demo.com" "Demo1234!" "Sarah Wijaya" "081234567001" "talent"
create_user "talent2@demo.com" "Demo1234!" "Andi Pratama" "081234567002" "talent"
create_user "talent3@demo.com" "Demo1234!" "Dina Putri" "081234567003" "talent"

# Create Clients
create_user "client1@demo.com" "Demo1234!" "PT Maju Jaya" "081234567011" "client"
create_user "client2@demo.com" "Demo1234!" "CV Sukses Bersama" "081234567012" "client"

echo ""
echo "========================================="
echo "📝 Post-Creation Steps"
echo "========================================="
echo ""
echo "⚠️  IMPORTANT: To activate admin user, run this SQL in Supabase:"
echo ""
echo "UPDATE profiles SET role = 'admin' WHERE email = 'admin@talentara.com';"
echo ""
echo "Or copy to clipboard:"
echo "echo \"UPDATE profiles SET role = 'admin' WHERE email = 'admin@talentara.com';\" | pbcopy"
echo ""

echo ""
echo "========================================="
echo "✅ DEMO USERS CREATED"
echo "========================================="
echo ""
echo "🔐 ADMIN ACCOUNT"
echo "   📧 admin@talentara.com"
echo "   🔑 Admin123!@#"
echo "   🎭 Role: admin (after SQL update)"
echo ""
echo "👤 TALENT ACCOUNTS"
echo "   📧 talent1@demo.com | 🔑 Demo1234! | Sarah Wijaya"
echo "   📧 talent2@demo.com | 🔑 Demo1234! | Andi Pratama"
echo "   📧 talent3@demo.com | 🔑 Demo1234! | Dina Putri"
echo ""
echo "🏢 CLIENT ACCOUNTS"
echo "   📧 client1@demo.com | 🔑 Demo1234! | PT Maju Jaya"
echo "   📧 client2@demo.com | 🔑 Demo1234! | CV Sukses Bersama"
echo ""
echo "========================================="
echo "🔗 QUICK ACCESS"
echo "========================================="
echo ""
echo "Login:        $API_URL/login"
echo "Talent Jobs:  $API_URL/jobs"
echo "Admin Panel:  $API_URL/admin (after role update)"
echo ""
echo "========================================="
echo ""
echo "📚 NEXT STEPS:"
echo "1. Run the SQL above to make admin@talentara.com an admin"
echo "2. Login to test each account"
echo "3. Complete talent profiles (add skills, portfolio, etc.)"
echo "4. Create sample job postings from client accounts"
echo ""
echo "✅ Setup Complete!"
echo ""
