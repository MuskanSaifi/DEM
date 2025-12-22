#!/bin/bash

# 🔧 Git Push Fix Script
# Usage: chmod +x fix-git-push.sh && ./fix-git-push.sh

echo "=========================================="
echo "🔧 Git Push Authentication Fix"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  Authentication issue detected!${NC}"
echo ""
echo "Choose an option:"
echo "1. Use Personal Access Token (Recommended - Easy)"
echo "2. Setup SSH Key (Permanent - Better)"
echo "3. Use Git Credential Helper (Quick)"
echo ""
read -p "Enter option (1/2/3): " option

case $option in
  1)
    echo ""
    echo -e "${YELLOW}📝 Personal Access Token Setup:${NC}"
    echo ""
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Name: 'DEM Push'"
    echo "4. Select 'repo' scope"
    echo "5. Click 'Generate token'"
    echo "6. Copy the token (it shows only once!)"
    echo ""
    read -p "Paste your token here: " token
    
    if [ -z "$token" ]; then
      echo -e "${RED}❌ Token cannot be empty!${NC}"
      exit 1
    fi
    
    # Update remote URL with token
    git remote set-url origin https://${token}@github.com/MuskanSaifi/DEM.git
    echo -e "${GREEN}✅ Remote URL updated with token${NC}"
    echo ""
    echo "Testing push..."
    git push origin main
    ;;
    
  2)
    echo ""
    echo -e "${YELLOW}🔑 SSH Key Setup:${NC}"
    echo ""
    
    # Check if SSH key exists
    if [ -f ~/.ssh/id_ed25519.pub ] || [ -f ~/.ssh/id_rsa.pub ]; then
      echo -e "${GREEN}✅ SSH key found!${NC}"
      echo ""
      echo "Your public key:"
      if [ -f ~/.ssh/id_ed25519.pub ]; then
        cat ~/.ssh/id_ed25519.pub
      else
        cat ~/.ssh/id_rsa.pub
      fi
      echo ""
      echo "1. Copy the key above"
      echo "2. Go to: https://github.com/settings/keys"
      echo "3. Click 'New SSH key'"
      echo "4. Paste the key and save"
      echo ""
      read -p "Press Enter after adding the key to GitHub..."
      
      # Update remote to SSH
      git remote set-url origin git@github.com:MuskanSaifi/DEM.git
      echo -e "${GREEN}✅ Remote URL updated to SSH${NC}"
      echo ""
      echo "Testing connection..."
      ssh -T git@github.com
      echo ""
      echo "Testing push..."
      git push origin main
    else
      echo "No SSH key found. Generating new key..."
      read -p "Enter your email: " email
      ssh-keygen -t ed25519 -C "$email" -f ~/.ssh/id_ed25519 -N ""
      echo ""
      echo "Your public key:"
      cat ~/.ssh/id_ed25519.pub
      echo ""
      echo "1. Copy the key above"
      echo "2. Go to: https://github.com/settings/keys"
      echo "3. Click 'New SSH key'"
      echo "4. Paste the key and save"
      echo ""
      read -p "Press Enter after adding the key to GitHub..."
      
      # Update remote to SSH
      git remote set-url origin git@github.com:MuskanSaifi/DEM.git
      echo -e "${GREEN}✅ Remote URL updated to SSH${NC}"
      echo ""
      echo "Testing connection..."
      ssh -T git@github.com
      echo ""
      echo "Testing push..."
      git push origin main
    fi
    ;;
    
  3)
    echo ""
    echo -e "${YELLOW}💾 Git Credential Helper Setup:${NC}"
    echo ""
    
    # Setup credential helper
    git config --global credential.helper osxkeychain
    echo -e "${GREEN}✅ Credential helper configured${NC}"
    echo ""
    echo "Now try pushing - it will ask for username/password once:"
    echo "Username: MuskanSaifi"
    echo "Password: Your Personal Access Token (not GitHub password!)"
    echo ""
    echo "To get token: https://github.com/settings/tokens"
    echo ""
    read -p "Press Enter to try push..."
    git push origin main
    ;;
    
  *)
    echo -e "${RED}❌ Invalid option!${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"

