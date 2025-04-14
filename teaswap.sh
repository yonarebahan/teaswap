#!/bin/bash

clear
echo ""
echo "                      .^!!^."
echo "                  .:~7?7!7??7~:."
echo "               :^!77!~:..^^~7?J?!^."
echo "           .^!7??!^..  ..^^^^^~JJJJ7~:."
echo "           7?????: ...^!7?!^^^~JJJJJJJ?."
echo "           7?????:...^???J7^^^~JJJJJJJJ."
echo "           7?????:...^??7?7^^^~JJJJJJJ?."
echo "           7?????:...^~:.^~^^^~JJJJJJJ?."
echo "           7?????:.. .:^!7!~^^~7?JJJJJ?."
echo "           7?????:.:~JGP5YJJ?7!^^~7?JJ?."
echo "           7?7?JY??JJ5BBBBG5YJJ?7!~7JJ?."
echo "           7Y5GBBYJJJ5BBBBBBBGP5Y5PGP5J."
echo "           ^?PBBBP555PBBBBBBBBBBBB#BPJ~"
echo "              :!YGB#BBBBBBBBBBBBGY7^"
echo "                 .~?5BBBBBBBBPJ~."
echo "                     :!YGGY7:"
echo "                        .."
echo ""
echo " 🚀 join channel Airdrop Sambil Rebahan : https://t.me/kingfeeder "
echo ""

echo "🚀 Setup lingkungan untuk TeaSwap"

# 1. Update system
echo "🔄 Updating package list..."
sudo apt update && sudo apt upgrade -y

# 2. Install curl dan build-essential
echo "📦 Installing curl and build tools..."
sudo apt install curl build-essential -y

# 3. Install Node.js & npm (LTS versi terbaru)
echo "⬇️ Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y

# 4. Cek versi
node -v
npm -v

# 6. Inisialisasi npm
echo "🧱 Inisialisasi npm project..."
npm init -y

# 7. Install dependencies
echo "📦 Install dependency: ethers, dotenv, prompt-sync..."
npm install ethers dotenv prompt-sync

# 9. Pesan selesai
echo "▶️ Jalankan script dengan: node teaswap.js"
