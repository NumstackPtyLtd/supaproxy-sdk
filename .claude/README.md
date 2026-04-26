# .claude

Claude Code configuration for the SupaProxy SDK.

## Contents

- **skills/** -- reusable task definitions invoked with `/skill-name`
- **hooks/** -- git hooks for code quality

## Skills

| Skill | Purpose |
|---|---|
| `/audit-sdk` | Type completeness, export coverage, server route alignment, build check |
| `/add-method` | Scaffold a new SDK method with types and exports |

## Hooks

| Hook | Purpose |
|---|---|
| `pre-commit` | Blocks committed secrets, `any` types in src/, and .env files |
