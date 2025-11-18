#!/bin/bash

echo "🧪 Quick Test Script for Outlook Add-in"
echo "========================================"

# 1. Check server
echo ""
echo "1️⃣ Checking server..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is NOT running"
    echo "   Run: cd ../server && npm run dev"
    exit 1
fi

# 2. Check API
echo ""
echo "2️⃣ Checking API..."
users_response=$(curl -s http://localhost:3001/api/users)
if [ ! -z "$users_response" ]; then
    echo "   ✅ API /users is accessible"
    user_count=$(echo $users_response | grep -o '"id"' | wc -l | tr -d ' ')
    echo "   📊 Found $user_count users"
else
    echo "   ⚠️  API is accessible but returned empty"
    echo "   💡 Run: cd ../server && npm run db:seed"
fi

# 3. Check taskpane
echo ""
echo "3️⃣ Checking taskpane.html..."
if curl -s http://localhost:3001/outlook/taskpane.html | grep -q "Office.onReady"; then
    echo "   ✅ taskpane.html is accessible and valid"
else
    echo "   ❌ taskpane.html is NOT accessible or invalid"
fi

# 4. Check manifest
echo ""
echo "4️⃣ Checking manifests..."
if [ -f "manifest.json" ]; then
    echo "   ✅ manifest.json exists (production)"
else
    echo "   ❌ manifest.json NOT found"
fi

if [ -f "manifest-dev.json" ]; then
    echo "   ✅ manifest-dev.json exists (development)"
    if node -e "JSON.parse(require('fs').readFileSync('manifest-dev.json'))" 2>/dev/null; then
        echo "   ✅ manifest-dev.json is valid JSON"
    else
        echo "   ❌ manifest-dev.json is INVALID JSON"
    fi
else
    echo "   ⚠️  manifest-dev.json NOT found (create it for local testing)"
fi

# 5. Check icons
echo ""
echo "5️⃣ Checking icons..."
icon_count=0
for size in 16 32 64 128; do
    if [ -f "icon-${size}.png" ]; then
        echo "   ✅ icon-${size}.png exists ($(du -h icon-${size}.png | cut -f1))"
        ((icon_count++))
    else
        echo "   ❌ icon-${size}.png NOT found"
    fi
done

if [ $icon_count -eq 4 ]; then
    echo "   🎉 All icons present!"
fi

# 6. Check legal pages
echo ""
echo "6️⃣ Checking legal pages..."
for page in privacy terms support; do
    if curl -s http://localhost:3001/${page}.html | grep -q "<!DOCTYPE html"; then
        echo "   ✅ ${page}.html is accessible"
    else
        echo "   ❌ ${page}.html is NOT accessible"
    fi
done

# Summary
echo ""
echo "========================================"
echo "📋 Next steps for testing:"
echo ""
echo "🌐 OPTION 1: Test on Outlook Web"
echo "   1. Open https://outlook.office.com"
echo "   2. Settings ⚙️ → Manage add-ins"
echo "   3. + My add-ins → Add from URL"
echo "   4. Enter: http://localhost:3001/outlook/manifest-dev.json"
echo "   5. Open any email and click 'Create Task'"
echo ""
echo "🖥️  OPTION 2: Test on Production Server"
echo "   1. Open https://outlook.office.com"
echo "   2. Settings ⚙️ → Manage add-ins"
echo "   3. + My add-ins → Add from URL"
echo "   4. Enter: https://task-manager.digitaldream.work/outlook/manifest.json"
echo ""
echo "💡 For debugging:"
echo "   • Press F12 in Outlook Web to open DevTools"
echo "   • Check Console tab for errors"
echo "   • Network tab to see API calls"
echo ""
echo "📚 Full guide: cat GUIDE_TEST_LOCAL.md"
echo ""
