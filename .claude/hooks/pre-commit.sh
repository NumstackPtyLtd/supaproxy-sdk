#!/bin/bash

# Pre-commit hook for supaproxy-sdk
# Blocks secrets, any types, and .env files in staged TypeScript files.

ERRORS=()
WARNINGS=()

# Get staged .ts files
STAGED_TS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$' || true)
# Get all staged files
STAGED_ALL=$(git diff --cached --name-only --diff-filter=ACM)

# ── Secret detection ──

for file in $STAGED_ALL; do
  content=$(git show ":$file" 2>/dev/null) || continue

  # AWS keys
  if echo "$content" | grep -qE 'AKIA[0-9A-Z]{16}'; then
    ERRORS+=("$file: possible AWS access key")
  fi

  # GitHub PATs
  if echo "$content" | grep -qE '(ghp_|github_pat_)[A-Za-z0-9_]+'; then
    ERRORS+=("$file: possible GitHub PAT")
  fi

  # Slack tokens
  if echo "$content" | grep -qE 'xox[bporas]-[A-Za-z0-9-]+'; then
    ERRORS+=("$file: possible Slack token")
  fi

  # Provider-specific token formats
  if echo "$content" | grep -qE 'sk-ant-[A-Za-z0-9-]+'; then
    ERRORS+=("$file: provider-specific token format (sk-ant-)")
  fi

  # Private keys
  if echo "$content" | grep -qE 'PRIVATE KEY'; then
    ERRORS+=("$file: possible private key")
  fi
done

# ── Block .env files ──

for file in $STAGED_ALL; do
  if [[ "$file" =~ ^\.env$ ]] || [[ "$file" =~ ^\.env\. ]] && [[ ! "$file" =~ \.example$ ]]; then
    ERRORS+=("$file: .env file must not be committed (only .env.example)")
  fi
done

# ── TypeScript checks ──

for file in $STAGED_TS; do
  [[ "$file" == src/* ]] || continue
  content=$(git show ":$file" 2>/dev/null) || continue

  # any types
  if echo "$content" | grep -nE ':\s*any\b|as\s+any\b' | grep -v '//.*any' | head -5 | while read -r line; do
    WARNINGS+=("$file:$line — contains 'any' type")
  done; then true; fi

  # Empty catch blocks
  if echo "$content" | grep -qE 'catch\s*\(\s*\)\s*\{?\s*\}'; then
    WARNINGS+=("$file: empty catch block")
  fi
done

# ── Report ──

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo "BLOCKED — fix these before committing:"
  echo ""
  for err in "${ERRORS[@]}"; do
    echo "  ERROR: $err"
  done
  echo ""
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "WARNINGS:"
  for warn in "${WARNINGS[@]}"; do
    echo "  WARN: $warn"
  done
  echo ""
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
  exit 1
fi

exit 0
