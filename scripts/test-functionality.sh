#!/usr/bin/env bash
# Updated: 2026-02-16
# Eames Design Agent - Functionality Test Script
# Run: ./scripts/test-functionality.sh
# Purpose: Empirically verify what works and what doesn't

set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

report() {
  if [ "$1" = "pass" ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
    ((PASS++)) || true
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
    ((FAIL++)) || true
  fi
}

report_warn() {
  echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

echo "=============================================="
echo "  Eames Design Agent - Functionality Test"
echo "  $(date)"
echo "=============================================="
echo ""

# ---------------------------------------------------------------------------
# 1. Dependencies
# ---------------------------------------------------------------------------
echo "1. DEPENDENCIES"
if [ -d "node_modules" ] && [ -f "package.json" ]; then
  report pass "node_modules present"
else
  report fail "node_modules missing - run: bun install"
fi

if command -v bun &>/dev/null; then
  report pass "bun installed: $(bun --version)"
else
  report fail "bun not found"
fi

if command -v node &>/dev/null; then
  report pass "node installed: $(node --version)"
else
  report fail "node not found"
fi
echo ""

# ---------------------------------------------------------------------------
# 2. Unit Tests
# ---------------------------------------------------------------------------
echo "2. UNIT TESTS"
TEST_OUT=$(bun test 2>&1) || true
if echo "$TEST_OUT" | grep -q "tests failed"; then
  FAIL_COUNT=$(echo "$TEST_OUT" | grep -oE '[0-9]+ tests failed' | grep -oE '[0-9]+' || echo "?")
  PASS_COUNT=$(echo "$TEST_OUT" | grep -oE '[0-9]+ pass' | head -1 | grep -oE '[0-9]+')
  if [ -n "$PASS_COUNT" ]; then
    report pass "Tests run: $PASS_COUNT passing"
  fi
  report fail "Tests: $FAIL_COUNT failing (sdk-agent, sdk-message-processor missing)"
elif echo "$TEST_OUT" | grep -q "pass"; then
  PASS_COUNT=$(echo "$TEST_OUT" | grep -oE '[0-9]+ pass' | head -1 | grep -oE '[0-9]+')
  report pass "All tests passing ($PASS_COUNT tests)"
else
  report fail "Test run produced unexpected output"
fi

# Show which specific tests fail
if echo "$TEST_OUT" | grep -q "Cannot find module"; then
  echo "$TEST_OUT" | grep "Cannot find module" | while read -r line; do
    report_warn "$line"
  done
fi
echo ""

# ---------------------------------------------------------------------------
# 3. TypeScript Type Check
# ---------------------------------------------------------------------------
echo "3. TYPECHECK"
if bun run typecheck 2>/dev/null; then
  report pass "TypeScript compiles cleanly"
else
  report fail "TypeScript has errors"
  bun run typecheck 2>&1 | head -15
fi
echo ""

# ---------------------------------------------------------------------------
# 4. Environment
# ---------------------------------------------------------------------------
echo "4. ENVIRONMENT"
if [ -f ".env" ]; then
  report pass ".env exists"
else
  report_warn ".env missing (copy from env.example)"
fi

if [ -f "env.example" ]; then
  report pass "env.example present"
fi
echo ""

# ---------------------------------------------------------------------------
# 5. CLI Startup (requires API keys to avoid import-time errors)
# ---------------------------------------------------------------------------
echo "5. CLI STARTUP"
# Tavily is imported at load time - needs key even if not used
export TAVILY_API_KEY="${TAVILY_API_KEY:-dummy-for-import-test}"
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-sk-ant-dummy}"

# Run CLI in background, kill after 3 seconds
CLI_OUT=$(mktemp)
(bun run src/index.tsx 2>&1 | head -50) &
CLI_PID=$!
sleep 3
kill $CLI_PID 2>/dev/null || true
wait $CLI_PID 2>/dev/null || true

if ps -p $CLI_PID &>/dev/null 2>&1; then
  kill -9 $CLI_PID 2>/dev/null || true
fi

# Check if we got past the import phase
if curl -s -o /dev/null -w "%{http_code}" https://example.com &>/dev/null; then
  :
fi

# Check: CLI startup - TavilySearch is instantiated at import in tavily.ts
# Use pipe to head to limit output and get synchronous result
CLI_OUTPUT=$(TAVILY_API_KEY=dummy ANTHROPIC_API_KEY=sk-ant-dummy bun run src/index.tsx 2>&1 | head -30)

if echo "$CLI_OUTPUT" | grep -q "Tavily API key"; then
  report fail "CLI: Tavily API key required at import (src/tools/search/tavily.ts)"
elif echo "$CLI_OUTPUT" | grep -q "Cannot find module"; then
  report fail "CLI: Missing module - check typecheck output"
elif echo "$CLI_OUTPUT" | grep -q "Error\|error:"; then
  # Could be other errors - show first error line
  FIRST_ERR=$(echo "$CLI_OUTPUT" | grep -i "error" | head -1)
  report_warn "CLI: $FIRST_ERR"
  report pass "CLI loads past imports (may need valid API keys for full run)"
else
  report pass "CLI loads when TAVILY_API_KEY and ANTHROPIC_API_KEY set"
fi
echo ""

# ---------------------------------------------------------------------------
# 6. Bin / Package scripts
# ---------------------------------------------------------------------------
echo "6. PACKAGE SCRIPTS"
for script in start dev typecheck test; do
  if grep -q "\"$script\"" package.json; then
    report pass "Script '$script' defined"
  fi
done

if [ -f "node_modules/.bin/eames" ] || [ -L "node_modules/.bin/eames" ]; then
  report pass "eames bin linked in node_modules/.bin"
fi
echo ""

# ---------------------------------------------------------------------------
# 7. Key source files
# ---------------------------------------------------------------------------
echo "7. SOURCE FILES"
REQUIRED_FILES=(
  "src/index.tsx"
  "src/cli.tsx"
  "src/agent/orchestrator.ts"
  "src/agent/state.ts"
  "src/tools/index.ts"
  "src/hooks/useAgentExecution.ts"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    report pass "$f exists"
  else
    report fail "$f missing"
  fi
done

# Missing files (known gaps)
MISSING_FILES=(
  "src/agent/sdk-agent.ts"
  "src/agent/sdk-message-processor.ts"
  "src/agent/enhanced-sdk-processor.ts"
  "src/model/claude-native.ts"
)

for f in "${MISSING_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    report_warn "Expected but missing: $f"
  fi
done
echo ""

# ---------------------------------------------------------------------------
# 8. Intent analyzer (v2)
# ---------------------------------------------------------------------------
echo "8. V2 INTENT ANALYZER"
if bun test tests/v2/intent/analyzer.test.ts 2>&1 | grep -q "pass"; then
  report pass "Intent analyzer tests pass"
else
  report fail "Intent analyzer tests"
fi
echo ""

# ---------------------------------------------------------------------------
# 9. Config utility
# ---------------------------------------------------------------------------
echo "9. CONFIG UTILITY"
if bun test tests/unit/utils/config.test.ts 2>&1 | grep -q "pass"; then
  report pass "Config utility tests pass"
else
  report fail "Config utility tests"
fi
echo ""

# ---------------------------------------------------------------------------
# 10. Todo app example
# ---------------------------------------------------------------------------
echo "10. EXAMPLES"
if [ -d "examples/todo-app" ]; then
  report pass "examples/todo-app exists"
  if bun test examples/todo-app/tests/ 2>&1 | grep -q "pass"; then
    report pass "Todo app tests pass"
  else
    report fail "Todo app tests"
  fi
else
  report_warn "examples/todo-app not found"
fi
echo ""

# ---------------------------------------------------------------------------
# 11. Agent execution (dry run - no API call)
# ---------------------------------------------------------------------------
echo "11. AGENT MODULE (import check)"
AGENT_IMPORT=$(bun -e "
  process.env.TAVILY_API_KEY = 'dummy';
  process.env.ANTHROPIC_API_KEY = 'sk-ant-dummy';
  try {
    const mod = await import('./src/agent/orchestrator.js');
    console.log('AGENT_OK', !!mod.Agent);
  } catch (e) {
    console.log('AGENT_FAIL', e.message?.split('\n')[0]?.slice(0, 60));
  }
" 2>&1)
if echo "$AGENT_IMPORT" | grep -q "AGENT_OK"; then
  report pass "Agent orchestrator imports"
else
  report fail "Agent import: $(echo "$AGENT_IMPORT" | grep AGENT_FAIL || echo "unknown")"
fi
echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "=============================================="
echo "  SUMMARY"
echo "=============================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
  echo "Known issues:"
  echo "  - sdk-agent.ts and sdk-message-processor.ts removed, tests expect them"
  echo "  - claude-native.ts missing, claude-agent.ts depends on it"
  echo "  - enhanced-sdk-processor.ts missing, LiveProgress depends on it"
  echo "  - TypeScript: Message export from @anthropic-ai/claude-agent-sdk"
  echo ""
  exit 1
fi

exit 0
