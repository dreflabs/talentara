#!/bin/bash

# ========================================
# TALENTARA - Create Admin User Script
# ========================================
# This script creates the first admin user
# Run this ONCE after initial deployment

set -e  # Exit on error

API_URL="${API_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@talentara.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!@#}"
ADMIN_NAME="${ADMIN_NAME:-Super Admin}"
ADMIN_PHONE="${ADMIN_PHONE:-081234567000}"

echo "========================================="
echo "🔐 TALENTARA - Admin User Creation"
echo "========================================="
echo ""
echo "⚙️  Configuration:"
echo "   API URL: $API_URL"
echo "   Email: $ADMIN_EMAIL"
echo "   Name: $ADMIN_NAME"
echo ""
echo "⚠️  WARNING: This will create an admin user with full access!"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled."
    exit 1
fi

echo ""
echo "📝 Creating admin user via API..."
echo ""

# Create admin user via registration endpoint
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"full_name\": \"$ADMIN_NAME\",
    \"phone\": \"$ADMIN_PHONE\",
    \"role\": \"client\"
  }")

# Extract HTTP code and body
HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_CODE\:.*//g')
HTTP_CODE=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_CODE://')

echo "Response Body: $HTTP_BODY"
echo "HTTP Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" != "201" ] && [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Failed to create user via API (HTTP $HTTP_CODE)"
    echo ""
    echo "📋 Manual steps required:"
    echo ""
    echo "Option 1: Create via Supabase Dashboard"
    echo "1. Go to: https://supabase.com/dashboard"
    echo "2. Select your TALENTARA project"
    echo "3. Go to: Authentication > Users > Add User"
    echo "4. Email: $ADMIN_EMAIL"
    echo "5. Password: $ADMIN_PASSWORD"
    echo "6. Auto Confirm: ✅ (check this)"
    echo "7. Click 'Create User'"
    echo ""
    echo "Option 2: Run SQL in Supabase SQL Editor"
    echo "See: supabase/migrations/create_admin_user.sql"
    echo ""
    exit 1
fi

# Extract user ID from response (assuming JSON response with user.id)
USER_ID=$(echo "$HTTP_BODY" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')

if [ -z "$USER_ID" ]; then
    echo "⚠️  User created but couldn't extract ID from response"
    echo "   You need to manually update role to 'admin' in database"
    echo ""
    echo "📋 Run this SQL in Supabase:"
    echo ""
    echo "   UPDATE profiles"
    echo "   SET role = 'admin'"
    echo "   WHERE email = '$ADMIN_EMAIL';"
    echo ""
    exit 0
fi

echo "✅ User created with ID: $USER_ID"
echo ""
echo "📝 Updating role to 'admin' in database..."
echo ""

# Note: We need to run SQL directly via Supabase
# This script will output the SQL needed

cat > /tmp/update_admin_role.sql <<EOF
-- Update user role to admin
UPDATE profiles
SET role = 'admin'
WHERE email = '$ADMIN_EMAIL';

-- Verify admin user
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE role = 'admin';
EOF

echo "⚠️  Manual step required:"
echo ""
echo "   Run this SQL in your Supabase SQL Editor:"
echo ""
cat /tmp/update_admin_role.sql
echo ""
echo "   Or run: cat /tmp/update_admin_role.sql | pbcopy (to copy to clipboard)"
echo ""

# Test login
echo "🔐 Testing admin login..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"
echo ""

echo "========================================="
echo "📝 ADMIN USER DETAILS"
echo "========================================="
echo ""
echo "Email:    $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo "Name:     $ADMIN_NAME"
echo "Phone:    $ADMIN_PHONE"
echo "Role:     admin (after SQL update)"
echo ""
echo "========================================="
echo "🔗 QUICK ACCESS"
echo "========================================="
echo ""
echo "Login:    $API_URL/login"
echo "Admin:    $API_URL/admin"
echo ""
echo "========================================="
echo ""
echo "⚠️  IMPORTANT: Save these credentials securely!"
echo "⚠️  Run the SQL above to complete admin role setup"
echo ""
echo "✅ Done!"
echo ""
