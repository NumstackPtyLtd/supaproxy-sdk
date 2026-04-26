---
name: audit-sdk
description: Audits the @supaproxy/sdk package for type completeness, export coverage, server route alignment, and build health. Run before publishing or creating a PR.
---

## Steps

### 1. Check build health

Run the TypeScript compiler and build:

```bash
pnpm lint    # tsc --noEmit
pnpm build   # compile to dist/
```

Report any compilation errors. If the build fails, stop here.

### 2. Check dist output

Scan the compiled output for quality issues:

- Check for `any` types in declaration files: `grep -r ": any" dist/ --include="*.d.ts"`
- Check that dist/index.js and dist/index.d.ts exist
- Verify all source files have corresponding dist output

Report any `any` types found in declarations. These leak untyped APIs to consumers.

### 3. Audit public exports

Read `src/index.ts` to list all public exports. For each export:

- Is it a class, type, interface, enum, or function?
- Does it have complete type annotations (no implicit any)?
- Is it documented in README.md?

Report: X of Y exports documented. List undocumented exports.

### 4. Type completeness

Scan all source files in `src/`:

- No `any` types or `as any` casts
- No `Partial<any>` or `Record<string, any>`
- All public methods have explicit return types
- All function parameters have explicit types
- All API response types are fully defined (no optional-everything interfaces)

Report violations with file and line number.

### 5. Error handling consistency

Check the client implementation:

- `SupaProxyError` is thrown for all non-ok responses
- Error messages include the HTTP status code
- No swallowed errors (empty catch blocks)
- `res.ok` is checked before parsing JSON

### 6. Server route alignment

If `supaproxy-server` is available as a sibling directory (check `../supaproxy-server/src/routes/`):

- List all route files in the server's `src/routes/` directory
- For each route file, read it to find endpoint paths (GET /api/..., POST /api/..., etc.)
- Check if `src/api.ts` (or `src/client.ts`) has a corresponding method for each endpoint
- Report missing SDK methods for server routes

If the server repo is not available, skip this step and note it.

### 7. Summary report

Output:

```
## SDK audit report: @supaproxy/sdk v{version}

### Build: {PASS/FAIL}
### Type safety: {N} issues
(list)

### Export coverage: {X}/{Y} documented
(list undocumented)

### Error handling: {PASS/N issues}
(list)

### Server alignment: {X}/{Y} routes covered
(list missing, or "server repo not found")

### Verdict: {CLEAN / {N} issues to fix}
```
