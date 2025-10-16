#!/bin/bash

################################################################################
# Solana Token Metadata Upload Script
#
# This script uploads token metadata to IPFS/Arweave and updates on-chain
#
# Usage: ./04-upload-metadata.sh --token <MINT_ADDRESS> --image <PATH> [OPTIONS]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
STORAGE="ipfs"
METADATA_DIR="$HOME/solana-tokens/metadata"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --token)
            TOKEN_MINT="$2"
            shift 2
            ;;
        --image)
            IMAGE_PATH="$2"
            shift 2
            ;;
        --name)
            TOKEN_NAME="$2"
            shift 2
            ;;
        --symbol)
            TOKEN_SYMBOL="$2"
            shift 2
            ;;
        --description)
            DESCRIPTION="$2"
            shift 2
            ;;
        --website)
            WEBSITE="$2"
            shift 2
            ;;
        --twitter)
            TWITTER="$2"
            shift 2
            ;;
        --telegram)
            TELEGRAM="$2"
            shift 2
            ;;
        --discord)
            DISCORD="$2"
            shift 2
            ;;
        --storage)
            STORAGE="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 --token <MINT> --image <PATH> --name <NAME> --symbol <SYMBOL>"
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$TOKEN_MINT" ]; then
    echo -e "${RED}Error: Token mint address is required${NC}"
    echo "Usage: $0 --token <MINT_ADDRESS>"
    exit 1
fi

echo -e "${GREEN}=== Token Metadata Upload ===${NC}"
echo ""
echo "Token Mint: $TOKEN_MINT"
echo "Storage: $STORAGE"
echo ""

# Create metadata directory
mkdir -p "$METADATA_DIR"

# If image not provided, prompt for it
if [ -z "$IMAGE_PATH" ]; then
    echo "No image path provided."
    echo "You can upload an image later or use a default one."
    IMAGE_URI="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
else
    # Validate image exists
    if [ ! -f "$IMAGE_PATH" ]; then
        echo -e "${RED}Error: Image file not found: $IMAGE_PATH${NC}"
        exit 1
    fi

    # Check image size
    IMAGE_SIZE=$(wc -c < "$IMAGE_PATH")
    if [ $IMAGE_SIZE -gt 1048576 ]; then
        echo -e "${YELLOW}Warning: Image is larger than 1MB. Consider optimizing.${NC}"
    fi

    echo "Image file: $IMAGE_PATH"
    echo "Image size: $(( IMAGE_SIZE / 1024 )) KB"
fi

# Prompt for metadata if not provided
if [ -z "$TOKEN_NAME" ]; then
    read -p "Enter token name: " TOKEN_NAME
fi

if [ -z "$TOKEN_SYMBOL" ]; then
    read -p "Enter token symbol: " TOKEN_SYMBOL
fi

if [ -z "$DESCRIPTION" ]; then
    read -p "Enter token description: " DESCRIPTION
fi

echo ""
echo "Creating metadata..."

# Create metadata JSON
METADATA_FILE="$METADATA_DIR/${TOKEN_MINT}.json"
cat > "$METADATA_FILE" << EOF
{
  "name": "$TOKEN_NAME",
  "symbol": "$TOKEN_SYMBOL",
  "description": "$DESCRIPTION",
  "image": "TO_BE_UPDATED",
  "external_url": "${WEBSITE:-}",
  "attributes": [],
  "properties": {
    "files": [
      {
        "uri": "TO_BE_UPDATED",
        "type": "image/png"
      }
    ],
    "category": "fungible"
  }
}
EOF

# Add social links if provided
if [ ! -z "$WEBSITE" ] || [ ! -z "$TWITTER" ] || [ ! -z "$TELEGRAM" ] || [ ! -z "$DISCORD" ]; then
    TEMP_FILE=$(mktemp)
    jq --arg website "$WEBSITE" --arg twitter "$TWITTER" --arg telegram "$TELEGRAM" --arg discord "$DISCORD" \
       '.properties.links = [] |
        if $website != "" then .properties.links += [{"label": "Website", "uri": $website}] else . end |
        if $twitter != "" then .properties.links += [{"label": "Twitter", "uri": $twitter}] else . end |
        if $telegram != "" then .properties.links += [{"label": "Telegram", "uri": $telegram}] else . end |
        if $discord != "" then .properties.links += [{"label": "Discord", "uri": $discord}] else . end' \
       "$METADATA_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$METADATA_FILE"
fi

echo -e "${GREEN}✓ Metadata file created${NC}"

# Upload to storage (simulated - requires actual API keys)
echo ""
echo -e "${YELLOW}=== Storage Upload ===${NC}"
echo ""
echo "NOTE: This is a template script. For production use, implement actual upload to:"
echo ""
echo "Option 1: IPFS (via Pinata)"
echo "  - Get API key from https://pinata.cloud"
echo "  - Use their API to upload image and metadata"
echo "  - Example: curl -X POST \"https://api.pinata.cloud/pinning/pinFileToIPFS\" -H \"pinata_api_key: YOUR_KEY\""
echo ""
echo "Option 2: Arweave (via Bundlr)"
echo "  - Install: npm install -g @bundlr-network/client"
echo "  - Upload: bundlr upload $IMAGE_PATH"
echo ""
echo "Option 3: NFT.Storage (Free)"
echo "  - Get API key from https://nft.storage"
echo "  - Use their client library"
echo ""

if [ ! -z "$IMAGE_PATH" ]; then
    echo "Your image is ready to upload: $IMAGE_PATH"
fi
echo "Your metadata is ready: $METADATA_FILE"
echo ""

# Provide manual instructions
echo -e "${BLUE}=== Manual Upload Steps ===${NC}"
echo ""
echo "1. Upload image to IPFS/Arweave:"
echo "   - Use Pinata: https://app.pinata.cloud/pinmanager"
echo "   - Or use NFT.Storage: https://nft.storage/files/"
echo "   - Copy the returned URI (e.g., ipfs://QmXxx...)"
echo ""
echo "2. Update metadata file with image URI:"
echo "   - Edit: $METADATA_FILE"
echo "   - Replace 'TO_BE_UPDATED' with your image URI"
echo ""
echo "3. Upload metadata JSON to IPFS/Arweave:"
echo "   - Upload: $METADATA_FILE"
echo "   - Copy the returned URI"
echo ""
echo "4. Update token metadata on-chain:"
echo "   - Use Metaplex Token Metadata program"
echo "   - Or use a service like Solana Token Manager"
echo ""

# For pump.fun, metadata is usually handled differently
echo -e "${YELLOW}=== For pump.fun ===${NC}"
echo ""
echo "If listing on pump.fun, you can upload metadata directly through their interface:"
echo "1. Go to https://pump.fun"
echo "2. Connect wallet"
echo "3. Click 'Create Token'"
echo "4. Upload image and fill details"
echo "5. Use your existing token mint: $TOKEN_MINT"
echo ""

# Create a README with instructions
README_FILE="$METADATA_DIR/README.md"
cat > "$README_FILE" << EOF
# Token Metadata Upload Instructions

## Token Information
- Mint Address: $TOKEN_MINT
- Name: $TOKEN_NAME
- Symbol: $TOKEN_SYMBOL

## Files
- Metadata JSON: ${TOKEN_MINT}.json
$([ ! -z "$IMAGE_PATH" ] && echo "- Image: $IMAGE_PATH")

## Upload Steps

### Using Pinata (IPFS)
1. Create account at https://pinata.cloud
2. Get API keys from account settings
3. Upload image:
   \`\`\`bash
   curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \\
     -H "pinata_api_key: YOUR_API_KEY" \\
     -H "pinata_secret_api_key: YOUR_SECRET_KEY" \\
     -F "file=@$IMAGE_PATH"
   \`\`\`
4. Update metadata with returned IPFS hash
5. Upload metadata JSON the same way

### Using Arweave
1. Install Bundlr: \`npm install -g @bundlr-network/client\`
2. Upload image: \`bundlr upload $IMAGE_PATH\`
3. Update metadata with returned Arweave URI
4. Upload metadata: \`bundlr upload ${METADATA_FILE}\`

### Using NFT.Storage (Free)
1. Get API key from https://nft.storage
2. Use their web interface or API
3. Automatically pins to IPFS

## For pump.fun
Simply use their web interface - it handles metadata automatically!

## Resources
- Pinata: https://pinata.cloud
- NFT.Storage: https://nft.storage
- Arweave: https://arweave.org
- Metaplex Docs: https://docs.metaplex.com
EOF

echo -e "${GREEN}✓ Instructions saved to: $README_FILE${NC}"
echo ""
echo -e "${GREEN}=== Summary ===${NC}"
echo "Metadata prepared for token: $TOKEN_MINT"
echo "Files saved to: $METADATA_DIR"
echo ""
echo "Next step: List on pump.fun with ./05-list-on-pumpfun.sh --token $TOKEN_MINT"
