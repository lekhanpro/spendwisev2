#!/bin/bash

echo "========================================"
echo "SpendWise Expo - Installation Script"
echo "========================================"
echo ""

echo "[1/3] Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Installation failed!"
    echo "Please check your internet connection and try again."
    exit 1
fi

echo ""
echo "[2/3] Installation complete!"
echo ""
echo "[3/3] Starting development server..."
echo ""
echo "Instructions:"
echo "- Press 'a' for Android emulator"
echo "- Press 'i' for iOS simulator"
echo "- Press 'w' for web browser"
echo "- Scan QR code with Expo Go app on your phone"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
