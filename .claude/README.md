# .claude

Claude Code configuration for the SupaProxy SDK.

## Contents

- **hooks/** -- git hooks for code quality

> **Note:** Skills now live in the central [supaproxy governance repo](https://github.com/NumstackPtyLtd/supaproxy).

## Hooks

| Hook | Purpose |
|---|---|
| `pre-commit` | Blocks committed secrets, `any` types in src/, and .env files |
