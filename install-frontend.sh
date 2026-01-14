#!/bin/bash

# Installation script for Fluxa Offline frontend dependencies

echo "🚀 Installing Fluxa Offline Frontend Dependencies..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm found"
echo ""

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "⚙️  Adding Tailwind CSS dependencies..."
pnpm add -D tailwindcss postcss autoprefixer

echo ""
echo "✨ Frontend setup complete!"
echo ""
echo "Next steps:"
echo "  1. pnpm dev          - Start development server"
echo "  2. pnpm build        - Build for production"
echo "  3. pnpm tauri dev    - Run Tauri development"
echo ""
echo "🎨 Theme: 'Abidjan Cyber-Griot'"
echo "🔐 Security: Rust Ed25519 + BLE"
echo ""
