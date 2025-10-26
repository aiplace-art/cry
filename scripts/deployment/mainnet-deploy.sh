#!/bin/bash

# ========================================
# HypeAI Mainnet Deployment Master Script
# Chain: BNB Chain Mainnet
# ========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Check if .env.mainnet exists
if [ ! -f "$PROJECT_ROOT/.env.mainnet" ]; then
    log_error ".env.mainnet file not found!"
    log_info "Please create .env.mainnet with required configuration"
    exit 1
fi

# Load environment
export $(cat "$PROJECT_ROOT/.env.mainnet" | grep -v '^#' | xargs)

log_info "=========================================="
log_info "HypeAI Mainnet Deployment"
log_info "Network: BNB Chain Mainnet"
log_info "=========================================="

# Pre-deployment checks
log_info "Running pre-deployment checks..."

# Check if hardhat is available
if ! command -v npx &> /dev/null; then
    log_error "npx not found. Please install Node.js and npm"
    exit 1
fi

# Check network connectivity
log_info "Checking BNB Chain connectivity..."
if ! curl -s --connect-timeout 5 "$BSC_RPC_URL" > /dev/null; then
    log_error "Cannot connect to BNB Chain RPC: $BSC_RPC_URL"
    exit 1
fi
log_success "Network connection OK"

# Check private key
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "0x...your_mainnet_private_key_here..." ]; then
    log_error "PRIVATE_KEY not set in .env.mainnet"
    exit 1
fi
log_success "Private key configured"

# Check BscScan API key
if [ -z "$BSCSCAN_API_KEY" ] || [ "$BSCSCAN_API_KEY" = "your_bscscan_api_key_here" ]; then
    log_warn "BSCSCAN_API_KEY not set. Contract verification will be skipped"
fi

# Check deployer balance
log_info "Checking deployer balance..."
BALANCE_CHECK=$(npx hardhat run "$SCRIPT_DIR/../check-mainnet-balance.js" --network bsc 2>&1 || echo "FAILED")
if [[ "$BALANCE_CHECK" == *"FAILED"* ]] || [[ "$BALANCE_CHECK" == *"Insufficient"* ]]; then
    log_error "Insufficient BNB balance for deployment"
    echo "$BALANCE_CHECK"
    exit 1
fi
log_success "Balance check passed"

# Confirmation prompt
log_warn "=========================================="
log_warn "MAINNET DEPLOYMENT WARNING"
log_warn "This will deploy contracts to BNB Chain Mainnet"
log_warn "Real BNB will be spent for gas fees"
log_warn "=========================================="
read -p "Are you sure you want to continue? (type 'YES' to confirm): " confirmation

if [ "$confirmation" != "YES" ]; then
    log_info "Deployment cancelled"
    exit 0
fi

# Create deployment directory
mkdir -p "$PROJECT_ROOT/deployments/mainnet"
mkdir -p "$PROJECT_ROOT/deployments/mainnet/logs"

# Log file
LOG_FILE="$PROJECT_ROOT/deployments/mainnet/logs/deployment-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

log_info "Deployment log: $LOG_FILE"

# Compile contracts
log_info "Compiling contracts..."
cd "$PROJECT_ROOT"
npx hardhat compile
log_success "Contracts compiled"

# Deployment counter
DEPLOYED=0
FAILED=0

# Deploy contracts sequentially
deploy_contract() {
    local script_name=$1
    local contract_name=$2

    log_info "=========================================="
    log_info "Deploying $contract_name..."
    log_info "=========================================="

    if npx hardhat run "$SCRIPT_DIR/$script_name" --network bsc; then
        log_success "$contract_name deployed successfully"
        ((DEPLOYED++))
        return 0
    else
        log_error "$contract_name deployment failed"
        ((FAILED++))
        return 1
    fi
}

# 1. Deploy Token
if ! deploy_contract "01-deploy-token.js" "Token"; then
    log_error "Token deployment failed. Aborting deployment."
    exit 1
fi

# Delay between deployments
sleep "${DEPLOY_DELAY_SECONDS:-10}"

# 2. Deploy Private Sale
if ! deploy_contract "02-deploy-private-sale.js" "Private Sale"; then
    log_warn "Private Sale deployment failed. Continuing with other contracts..."
fi

sleep "${DEPLOY_DELAY_SECONDS:-10}"

# 3. Deploy Referral System
if ! deploy_contract "03-deploy-referral.js" "Referral System"; then
    log_warn "Referral System deployment failed. Continuing with other contracts..."
fi

sleep "${DEPLOY_DELAY_SECONDS:-10}"

# 4. Deploy Vesting
if ! deploy_contract "04-deploy-vesting.js" "Vesting"; then
    log_warn "Vesting deployment failed. Continuing with other contracts..."
fi

sleep "${DEPLOY_DELAY_SECONDS:-10}"

# 5. Deploy Governance
if ! deploy_contract "05-deploy-governance.js" "Governance DAO"; then
    log_warn "Governance DAO deployment failed. Continuing with other contracts..."
fi

sleep "${DEPLOY_DELAY_SECONDS:-10}"

# 6. Deploy Staking
if ! deploy_contract "06-deploy-staking.js" "Staking"; then
    log_warn "Staking deployment failed. Continuing with other contracts..."
fi

sleep "${DEPLOY_DELAY_SECONDS:-10}"

# 7. Deploy Oracle
if ! deploy_contract "07-deploy-oracle.js" "AI Oracle"; then
    log_warn "AI Oracle deployment failed. Continuing with verification..."
fi

# Contract Verification
if [ "$VERIFY_CONTRACTS" = "true" ] && [ -n "$BSCSCAN_API_KEY" ]; then
    log_info "=========================================="
    log_info "Starting contract verification on BscScan..."
    log_info "=========================================="

    sleep 30  # Wait for BscScan to index contracts

    if npx hardhat run "$SCRIPT_DIR/08-verify-contracts.js" --network bsc; then
        log_success "Contract verification completed"
    else
        log_warn "Some contracts failed verification. Check logs for details."
    fi
else
    log_warn "Contract verification skipped (VERIFY_CONTRACTS=$VERIFY_CONTRACTS)"
fi

# Deployment Summary
log_info "=========================================="
log_info "Deployment Summary"
log_info "=========================================="
log_success "Deployed: $DEPLOYED contracts"
if [ $FAILED -gt 0 ]; then
    log_error "Failed: $FAILED contracts"
fi
log_info "=========================================="

# Generate deployment report
REPORT_FILE="$PROJECT_ROOT/deployments/mainnet/deployment-summary.txt"
cat > "$REPORT_FILE" << EOF
HypeAI Mainnet Deployment Summary
=================================
Timestamp: $(date)
Network: BNB Chain Mainnet (Chain ID: 56)
Deployed: $DEPLOYED contracts
Failed: $FAILED contracts

Deployment Log: $LOG_FILE

Next Steps:
1. Verify all contract addresses on BscScan
2. Transfer tokens to respective contracts
3. Configure contract parameters
4. Test all functionality
5. Update frontend with new contract addresses
6. Announce deployment to community

For detailed deployment data, check:
$PROJECT_ROOT/deployments/mainnet/
EOF

log_info "Deployment report saved: $REPORT_FILE"

# Notification (if configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"HypeAI Mainnet Deployment Complete\\nDeployed: $DEPLOYED contracts\\nFailed: $FAILED contracts\"}" \
        "$SLACK_WEBHOOK_URL" &>/dev/null || true
fi

if [ $FAILED -eq 0 ]; then
    log_success "=========================================="
    log_success "ALL CONTRACTS DEPLOYED SUCCESSFULLY!"
    log_success "=========================================="
    exit 0
else
    log_warn "=========================================="
    log_warn "DEPLOYMENT COMPLETED WITH ERRORS"
    log_warn "=========================================="
    exit 1
fi
