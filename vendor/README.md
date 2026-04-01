# vendor/

This directory contains pre-built packages from the [`atproto-packages`](https://github.com/gainforest/atproto-packages) monorepo so that `bumicerts` can run as a fully standalone app — no monorepo checkout required.

---

## For app-only developers

You **do not need the monorepo**. The tarballs in `vendor/` are committed to git.

Just:

```bash
bun install
bun run dev
```

That's it. The packages are resolved from `vendor/` locally.

---

## For package developers

You need the monorepo when you want to make changes to internal packages and test them against bumicerts before pushing anywhere.

### Setup

1. Clone [`atproto-packages`](https://github.com/gainforest/atproto-packages) as a **sibling** of this repo:
   ```
   some-parent/
     atproto-packages/    ← monorepo
       packages/
         atproto-mutations-next/
         ...
     bumicerts-platform/  ← this repo
       vendor/
   ```
2. Run `bun install` from this repo's root (not the monorepo root)

### Regenerating vendor after package changes

After you make changes to any package in the monorepo:

```bash
# From the bumicerts-platform root
bun run vendor:generate
```

This will:
1. Build all packages in dependency order
2. Pack each into a tarball in `vendor/`
3. Copy source-only packages (like `@gainforest/generated`) into `vendor/`
4. Patch `package.json` to reference the new tarballs
5. Write `vendor/vendor.json` with metadata about this generation

Then:
```bash
bun install   # pick up the new tarballs
bun run dev   # test your changes
```

### Skipping the build step

If you've already built the packages and just want to repack:

```bash
bun run vendor:generate -- --no-build
```

### Monorepo in a custom location

By default the script expects `atproto-packages` to be a sibling of `bumicerts-platform`. If your monorepo is elsewhere, pass the path explicitly:

```bash
bun run vendor:generate -- --monorepo /path/to/atproto-packages
```

---

## The `vendor.json` file

`vendor.json` is **auto-generated** by `generate.ts`. Never edit it manually.

It records:
- **`generatedAt`** — when vendor was generated
- **`source.commit`** — the exact git commit of `atproto-packages` used
- **`source.branch`** — which branch of `atproto-packages`
- **`source.clean`** — whether `atproto-packages` had uncommitted changes at generation time
- **`packages`** — which packages were packed, at which versions

This lets you look at any bumicerts commit and know exactly which version of the packages it was built from.

---

## The `sources.json` file

`sources.json` declares which monorepo packages bumicerts depends on. It is **manually maintained**.

When adding a new internal package dependency:
1. Add an entry to `vendor/sources.json`
2. Run `bun run vendor:generate`
3. Commit the updated `vendor/`

---

## Commit and push rules

These are enforced by Husky hooks.

### Committing

**Blocked** if `vendor.json` has `clean: false` — the vendor was built from uncommitted package changes and would be unreproducible.

To fix: commit your changes in `atproto-packages`, then re-run `bun run vendor:generate`.

To bypass for WIP purposes: `git commit --no-verify`

> **Note:** WIP commits (with `clean: false`) cannot be pushed. You will need to update them before pushing.

### Pushing

**Blocked** if `vendor.json` has `clean: false` — even if the commit was made with `--no-verify`.

To fix:
1. Commit and push your changes in `atproto-packages`
2. Re-run `bun run vendor:generate`
3. Commit the updated vendor
4. Push again

To bypass (not recommended — makes vendor unreproducible): `git push --no-verify`

---

## File reference

| File | Auto-generated? | Purpose |
|---|---|---|
| `sources.json` | No | Declares which packages to pack |
| `generate.ts` | No | The generation script |
| `vendor.json` | Yes — do not edit | Metadata: commit, clean, packages |
| `*.tgz` | Yes — do not edit | Packed package tarballs |
| `gainforest-generated/` | Yes — do not edit | Source-only generated types |
| `README.md` | No | This file |
| `AGENTS.md` | No | AI agent instructions |
