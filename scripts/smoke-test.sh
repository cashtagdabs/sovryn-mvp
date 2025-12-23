#!/bin/bash

# PRIMEX Smoke Test Script
# Tests local PRIMEX invocation and fallback chain
#
# Usage:
#   ./scripts/smoke-test.sh [options]
#
# Options:
#   --primex-url=<url>      Override PRIMEX backend URL (default: http://localhost:8000)
#   --test-token=<token>    Clerk auth token for testing
#   --skip-primex           Skip PRIMEX test, test fallback only
#   --skip-fallback         Skip fallback test
#   --verbose               Enable verbose logging

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Config
PRIMEX_URL="${PRIMEX_URL:-http://localhost:8000}"
CHAT_ENDPOINT="http://localhost:3000/api/chat"
SKIP_PRIMEX=false
SKIP_FALLBACK=false
VERBOSE=false
TEST_TOKEN=""

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --primex-url=*)
      PRIMEX_URL="${1#*=}"
      shift
      ;;
    --test-token=*)
      TEST_TOKEN="${1#*=}"
      shift
      ;;
    --skip-primex)
      SKIP_PRIMEX=true
      shift
      ;;
    --skip-fallback)
      SKIP_FALLBACK=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Utility functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_verbose() {
  if [[ "$VERBOSE" == true ]]; then
    echo -e "${YELLOW}[DEBUG]${NC} $1"
  fi
}

# Check if service is running
check_service() {
  local url=$1
  local name=$2
  
  if curl -s --connect-timeout 2 "$url" > /dev/null 2>&1; then
    log_info "$name is healthy ✓"
    return 0
  else
    log_warn "$name is unreachable at $url"
    return 1
  fi
}

# Test PRIMEX endpoint
test_primex() {
  if [[ "$SKIP_PRIMEX" == true ]]; then
    log_warn "Skipping PRIMEX test"
    return 0
  fi
  
  echo ""
  log_info "=== Testing PRIMEX Backend ==="
  
  if ! check_service "$PRIMEX_URL/health" "PRIMEX"; then
    log_error "PRIMEX backend not running at $PRIMEX_URL"
    log_info "Start PRIMEX with: PRIMEX_BACKEND_URL=$PRIMEX_URL npm run dev"
    return 1
  fi
  
  return 0
}

# Test Next.js chat endpoint
test_chat_endpoint() {
  echo ""
  log_info "=== Testing Chat Endpoint ==="
  
  if ! check_service "$CHAT_ENDPOINT" "Next.js"; then
    log_error "Chat endpoint not running at $CHAT_ENDPOINT"
    log_info "Start app with: npm run dev"
    return 1
  fi
  
  return 0
}

# Make a chat request
make_chat_request() {
  local model=$1
  local auth_token=$2
  
  if [[ -z "$auth_token" ]]; then
    log_warn "No auth token provided, request will be unauthorized (expected for smoke test)"
  fi
  
  log_info "Requesting chat with model: $model"
  
  local response=$(curl -s -X POST "$CHAT_ENDPOINT" \
    -H "Content-Type: application/json" \
    ${auth_token:+-H "Authorization: Bearer $auth_token"} \
    -d "{
      \"modelId\": \"$model\",
      \"messages\": [
        {\"role\": \"user\", \"content\": \"Say hello in one word.\"}
      ]
    }" \
    2>&1)
  
  log_verbose "Response: $response"
  
  # Parse response
  if echo "$response" | grep -q '"error"'; then
    local error=$(echo "$response" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    log_warn "Request failed: $error"
    return 1
  elif echo "$response" | grep -q '"content"'; then
    local content=$(echo "$response" | grep -o '"content":"[^"]*' | cut -d'"' -f4 | head -c 50)
    local fallback=$(echo "$response" | grep -o '"fallback":[a-z]*' | cut -d':' -f2)
    log_info "Success! Content: $content... (fallback=$fallback)"
    return 0
  else
    log_error "Unexpected response format: $response"
    return 1
  fi
}

# Test PRIMEX model with fallback
test_primex_with_fallback() {
  echo ""
  log_info "=== Testing PRIMEX Model (primex-ultra) ==="
  
  if make_chat_request "primex-ultra" "$TEST_TOKEN"; then
    log_info "PRIMEX invocation successful"
    return 0
  else
    if [[ "$SKIP_FALLBACK" == true ]]; then
      log_error "PRIMEX failed and fallback is disabled"
      return 1
    else
      log_warn "PRIMEX failed, checking fallback chain..."
      return 0  # Continue to fallback test
    fi
  fi
}

# Test fallback providers
test_fallback_providers() {
  if [[ "$SKIP_FALLBACK" == true ]]; then
    log_warn "Skipping fallback test"
    return 0
  fi
  
  echo ""
  log_info "=== Testing Fallback Providers ==="
  
  local fallback_models=("openai:gpt-4-turbo-preview" "groq:mixtral-8x7b-32768" "anthropic:claude-3-sonnet-20240229")
  local success=false
  
  for model in "${fallback_models[@]}"; do
    log_info "Testing fallback: $model"
    if make_chat_request "$model" "$TEST_TOKEN"; then
      success=true
      break
    fi
  done
  
  if [[ "$success" == true ]]; then
    return 0
  else
    log_error "All fallback providers failed"
    return 1
  fi
}

# Main test flow
main() {
  echo -e "\n${GREEN}PRIMEX Smoke Test Suite${NC}"
  echo "========================="
  log_info "Starting smoke tests..."
  log_info "PRIMEX URL: $PRIMEX_URL"
  log_info "Chat Endpoint: $CHAT_ENDPOINT"
  
  # Pre-flight checks
  test_chat_endpoint || exit 1
  test_primex || {
    if [[ "$SKIP_PRIMEX" == false ]]; then
      log_warn "PRIMEX not available, will test fallback"
    fi
  }
  
  # Run tests
  test_primex_with_fallback || exit 1
  test_fallback_providers || exit 1
  
  # Summary
  echo ""
  log_info "=== Test Summary ==="
  log_info "All tests passed ✓"
  log_info "PRIMEX smoke test completed successfully"
  echo ""
}

# Run
main "$@"
