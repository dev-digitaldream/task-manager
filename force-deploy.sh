#!/bin/bash

echo "🚀 Force Deployment to CapRover"
echo "================================"
echo ""

# Create a tarball excluding unnecessary files
echo "📦 Creating deployment tarball..."
tar -czf deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='landing' \
  --exclude='*.log' \
  --exclude='dist' \
  --exclude='*.md' \
  --exclude='.env*' \
  --exclude='deploy.tar.gz' \
  .

if [ -f deploy.tar.gz ]; then
    SIZE=$(du -h deploy.tar.gz | cut -f1)
    echo "✅ Tarball created: deploy.tar.gz ($SIZE)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to your CapRover dashboard"
    echo "2. Select 'task-manager' app"
    echo "3. Go to 'Deployment' tab"
    echo "4. Upload deploy.tar.gz"
    echo ""
    echo "Or use CapRover CLI:"
    echo "  caprover deploy -t ./deploy.tar.gz"
    echo ""
    echo "Tarball ready: $(pwd)/deploy.tar.gz"
else
    echo "❌ Failed to create tarball"
    exit 1
fi
