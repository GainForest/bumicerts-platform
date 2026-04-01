#!/usr/bin/env bun
/**
 * vendor/generate.ts
 *
 * Builds, packs, and installs all monorepo packages into vendor/ so that
 * bumicerts can run as a fully standalone app without the monorepo.
 *
 * Usage (from the app root directory):
 *   bun run vendor:generate                       # full build + pack
 *   bun run vendor:generate -- --no-build         # skip build, use existing dist/
 *   bun run vendor:generate -- --monorepo <path>  # override monorepo location
 *
 * Reads:    vendor/sources.json   (what to pack — manually maintained)
 * Writes:   vendor/*.tgz          (packed packages)
 *           vendor/<dir>/         (source-only packages)
 *           vendor/vendor.json    (auto-generated manifest — do not edit)
 *           package.json          (patches workspace:* → file:./vendor/...)
 *
 * See vendor/README.md for full documentation.
 * See vendor/AGENTS.md if a commit or push is blocked.
 */

import {
  existsSync,
  mkdirSync,
  rmSync,
  cpSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "fs";
import { resolve, join, relative, dirname } from "path";
import { spawnSync } from "child_process";

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1] !== undefined) return args[idx + 1] as string;
  return null;
}

const NO_BUILD       = args.includes("--no-build");
const MONOREPO_OVERRIDE = getArg("--monorepo");

// ── Paths ─────────────────────────────────────────────────────────────────────

const VENDOR_DIR  = resolve(dirname(new URL(import.meta.url as string).pathname));
const APP_DIR     = resolve(VENDOR_DIR, "..");
const TMP_DIR     = join(VENDOR_DIR, ".tmp-pack");
const SOURCES_PATH  = join(VENDOR_DIR, "sources.json");
const VENDOR_JSON   = join(VENDOR_DIR, "vendor.json");
const APP_PKG_PATH  = join(APP_DIR, "package.json");

// Files/dirs inside vendor/ that must never be deleted during cleanup
const VENDOR_PRESERVED = new Set([
  "sources.json",
  "generate.ts",
  "vendor.json",
  "README.md",
  "AGENTS.md",
]);

// ── Types ─────────────────────────────────────────────────────────────────────

interface SourceEntry {
  name: string;
  type: "buildable" | "source-only";
  dependencyField: "dependencies" | "devDependencies";
  transitive?: boolean;
}

interface Sources {
  _README?: string;
  monorepoPath: string;
  packages: SourceEntry[];
}

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  scripts?: Record<string, string>;
  files?: string[];
  exports?: Record<string, unknown> | string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`\n▸ ${msg}`); }
function step(msg: string) { console.log(`  ${msg}`); }
function warn(msg: string) { console.warn(`  ⚠️  ${msg}`); }

function fail(msg: string): never {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function run(cmd: string, cwd: string) {
  console.log(`  $ ${cmd}`);
  const result = spawnSync(cmd, { cwd, shell: true, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Command failed: ${cmd}`);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

function writeJson(filePath: string, obj: unknown) {
  writeFileSync(filePath, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}

/**
 * Derives the tarball filename bun pm pack produces.
 * @scope/name@version → scope-name-version.tgz
 */
function tarballFilename(name: string, version: string): string {
  const normalized = name.startsWith("@")
    ? name.slice(1).replace("/", "-")
    : name;
  return `${normalized}-${version}.tgz`;
}

/**
 * Derives the folder name for source-only packages.
 * @scope/name → scope-name
 */
function folderName(name: string): string {
  return name.startsWith("@") ? name.slice(1).replace("/", "-") : name;
}

/**
 * Scans monorepo workspace dirs to find the package directory matching `name`.
 */
function findPackageDir(name: string, monorepoRoot: string): string | null {
  const rootPkg = readJson<PackageJson>(join(monorepoRoot, "package.json"));
  const workspaces: string[] = (rootPkg as unknown as { workspaces?: string[] }).workspaces ?? [];

  for (const pattern of workspaces) {
    const base = pattern.replace(/\/\*$/, "");
    const baseDir = join(monorepoRoot, base);
    if (!existsSync(baseDir)) continue;

    let dirs: string[];
    if (pattern.endsWith("/*")) {
      dirs = readdirSync(baseDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => join(baseDir, d.name));
    } else {
      dirs = [join(monorepoRoot, pattern)];
    }

    for (const dir of dirs) {
      const pkgPath = join(dir, "package.json");
      if (!existsSync(pkgPath)) continue;
      const pkg = readJson<PackageJson>(pkgPath);
      if (pkg.name === name) return dir;
    }
  }

  return null;
}

/**
 * Topologically sorts packages by their workspace:* inter-dependencies.
 * Dependencies come before dependents.
 */
function topoSort(
  packages: Array<{ entry: SourceEntry; dir: string; pkgJson: PackageJson }>
): Array<{ entry: SourceEntry; dir: string; pkgJson: PackageJson }> {
  const nameToItem = new Map(packages.map((p) => [p.entry.name, p]));
  const visited = new Set<string>();
  const sorted: typeof packages = [];

  function visit(item: (typeof packages)[number]) {
    if (visited.has(item.entry.name)) return;
    visited.add(item.entry.name);

    const allDeps = {
      ...item.pkgJson.dependencies,
      ...item.pkgJson.devDependencies,
    };

    for (const [depName, depVersion] of Object.entries(allDeps)) {
      if (depVersion !== "workspace:*") continue;
      const dep = nameToItem.get(depName);
      if (dep) visit(dep);
    }

    sorted.push(item);
  }

  for (const item of packages) visit(item);
  return sorted;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║     vendor/generate.ts — bumicerts       ║");
  console.log("╚══════════════════════════════════════════╝");

  // ── 1. Read sources.json ────────────────────────────────────────────────────
  log("Step 1 — Reading vendor/sources.json");

  if (!existsSync(SOURCES_PATH)) {
    fail("vendor/sources.json not found. Run this script from the app root directory.");
  }

  const sources = readJson<Sources>(SOURCES_PATH);
  step(`Found ${sources.packages.length} package entries`);

  // ── 2. Resolve monorepo root ────────────────────────────────────────────────
  log("Step 2 — Locating monorepo");

  const monorepoRoot = MONOREPO_OVERRIDE
    ? resolve(MONOREPO_OVERRIDE)
    : resolve(VENDOR_DIR, sources.monorepoPath);

  if (
    !existsSync(monorepoRoot) ||
    !existsSync(join(monorepoRoot, "packages")) ||
    !existsSync(join(monorepoRoot, "package.json"))
  ) {
    fail(
      `Monorepo not found at: ${monorepoRoot}\n\n` +
      `  Pass the monorepo path explicitly:\n` +
      `    bun run vendor:generate -- --monorepo /path/to/atproto-packages\n\n` +
      `  If you are developing app-only and don't have the monorepo,\n` +
      `  the existing vendor/ tarballs are already committed — run bun install.`
    );
  }

  step(`Monorepo: ${monorepoRoot}`);

  // ── 3. Resolve each package to its directory ────────────────────────────────
  log("Step 3 — Resolving package directories");

  const resolved = sources.packages.map((entry) => {
    const dir = findPackageDir(entry.name, monorepoRoot);
    if (!dir) {
      fail(
        `Package "${entry.name}" not found in monorepo workspaces.\n` +
        `  Check that vendor/sources.json is correct and the package exists in the monorepo.`
      );
    }
    const pkgJson = readJson<PackageJson>(join(dir, "package.json"));
    step(
      `  ${entry.type === "source-only" ? "[source]" : "[build] "} ${entry.name}@${pkgJson.version} → ${relative(monorepoRoot, dir)}`
    );
    return { entry, dir, pkgJson };
  });

  const buildable  = resolved.filter((r) => r.entry.type === "buildable");
  const sourceOnly = resolved.filter((r) => r.entry.type === "source-only");

  // ── 4. Topological sort ─────────────────────────────────────────────────────
  log("Step 4 — Determining build order");
  const sorted = topoSort(buildable);
  step(`Build order: ${sorted.map((r) => r.entry.name).join(" → ")}`);

  // ── 5. Build packages ───────────────────────────────────────────────────────
  if (!NO_BUILD) {
    log("Step 5 — Building packages");
    for (const { entry, dir } of sorted) {
      step(`Building ${entry.name}...`);
      try {
        run("bun run build", dir);
      } catch {
        fail(
          `Build failed for ${entry.name}.\n` +
          `  Make sure you are in the atproto-packages monorepo and packages compile correctly.`
        );
      }
    }
  } else {
    log("Step 5 — Skipping build (--no-build)");
    // Verify dist/ exists for each buildable package
    for (const { entry, dir } of sorted) {
      if (!existsSync(join(dir, "dist"))) {
        fail(
          `${entry.name} has no dist/ directory.\n` +
          `  Remove --no-build to build packages first, or run:\n` +
          `    bun run build   (from monorepo root)`
        );
      }
    }
    step("All packages have dist/ — proceeding with existing builds");
  }

  // ── 6. Clean vendor/ (preserve non-generated files) ─────────────────────────
  log("Step 6 — Cleaning vendor/");

  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });

  // Remove old tarballs
  for (const entry of readdirSync(VENDOR_DIR, { withFileTypes: true })) {
    if (VENDOR_PRESERVED.has(entry.name)) continue;
    const fullPath = join(VENDOR_DIR, entry.name);
    rmSync(fullPath, { recursive: true, force: true });
    step(`Removed ${entry.name}`);
  }

  // ── 7. Pack buildable packages ───────────────────────────────────────────────
  log("Step 7 — Packing buildable packages");

  // Build workspace:* → file: replacement map for use inside temp package.jsons
  const fileRefMap: Record<string, string> = {};
  for (const { entry, pkgJson } of resolved) {
    if (entry.type === "buildable") {
      fileRefMap[entry.name] = `file:./vendor/${tarballFilename(entry.name, pkgJson.version)}`;
    } else {
      fileRefMap[entry.name] = `file:./vendor/${folderName(entry.name)}`;
    }
  }

  for (const { entry, dir, pkgJson } of sorted) {
    step(`Packing ${entry.name}@${pkgJson.version}...`);

    const tmpPkgDir = join(TMP_DIR, folderName(entry.name));
    cpSync(dir, tmpPkgDir, { recursive: true });

    // Patch workspace:* refs in temp copy to "*" so bun resolves them
    // from the outer package.json (which has the correct file: tarball refs).
    // Using file:./vendor/... here would resolve relative to the tarball's
    // install location inside node_modules, not the app root — causing failures.
    const tmpPkgJsonPath = join(tmpPkgDir, "package.json");
    const tmpPkg = readJson<Record<string, unknown>>(tmpPkgJsonPath);

    for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
      const deps = tmpPkg[field] as Record<string, string> | undefined;
      if (!deps) continue;
      for (const dep of Object.keys(deps)) {
        if (deps[dep] === "workspace:*" && fileRefMap[dep]) {
          // Remove internal workspace deps from the tarball entirely.
          // They are already declared in the app's package.json as file: refs
          // and will be hoisted correctly by bun. Keeping them inside the tarball
          // causes bun to try resolving them from the registry (which fails since
          // these are private packages not published to npm).
          delete deps[dep];
        }
      }
    }
    delete tmpPkg["private"];
    writeJson(tmpPkgJsonPath, tmpPkg);

    try {
      run(`bun pm pack --destination "${VENDOR_DIR}"`, tmpPkgDir);
    } catch {
      rmSync(TMP_DIR, { recursive: true, force: true });
      fail(`bun pm pack failed for ${entry.name}.`);
    }

    rmSync(tmpPkgDir, { recursive: true, force: true });
  }

  // ── 8. Copy source-only packages ─────────────────────────────────────────────
  log("Step 8 — Copying source-only packages");

  for (const { entry, dir, pkgJson } of sourceOnly) {
    const dest = join(VENDOR_DIR, folderName(entry.name));
    step(`Copying ${entry.name}@${pkgJson.version} → vendor/${folderName(entry.name)}`);
    cpSync(dir, dest, { recursive: true });
  }

  // ── 9. Check monorepo cleanliness ────────────────────────────────────────────
  log("Step 9 — Checking monorepo cleanliness");

  const gitStatus = spawnSync("git status --porcelain -- packages/ GENERATED/", {
    cwd: monorepoRoot,
    shell: true,
    encoding: "utf-8",
  });

  const clean = gitStatus.stdout.trim() === "";
  const gitCommit = spawnSync("git rev-parse HEAD", {
    cwd: monorepoRoot,
    shell: true,
    encoding: "utf-8",
  }).stdout.trim();

  const gitBranch = spawnSync("git branch --show-current", {
    cwd: monorepoRoot,
    shell: true,
    encoding: "utf-8",
  }).stdout.trim();

  const gitRemote = spawnSync("git remote get-url origin", {
    cwd: monorepoRoot,
    shell: true,
    encoding: "utf-8",
  }).stdout.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");

  if (clean) {
    step("✓ atproto-packages is clean — vendor is fully reproducible");
  } else {
    warn("atproto-packages has uncommitted changes in packages/ or GENERATED/");
    warn("vendor.json will have clean: false");
    warn("This vendor CANNOT be committed or pushed until atproto-packages is clean.");
    warn("See vendor/AGENTS.md for resolution steps.");
  }

  // ── 10. Write vendor.json ────────────────────────────────────────────────────
  log("Step 10 — Writing vendor/vendor.json");

  const packagesRecord: Record<string, { version: string; tarball?: string; directory?: string }> = {};
  for (const { entry, pkgJson } of resolved) {
    if (entry.type === "buildable") {
      packagesRecord[entry.name] = {
        version: pkgJson.version,
        tarball: tarballFilename(entry.name, pkgJson.version),
      };
    } else {
      packagesRecord[entry.name] = {
        version: pkgJson.version,
        directory: folderName(entry.name),
      };
    }
  }

  writeJson(VENDOR_JSON, {
    "_WARNING": "AUTO-GENERATED by vendor/generate.ts — DO NOT EDIT. AI agents: read vendor/AGENTS.md if a commit or push is blocked.",
    generatedAt: new Date().toISOString(),
    source: {
      repo: gitRemote,
      commit: gitCommit,
      branch: gitBranch,
      clean,
    },
    packages: packagesRecord,
  });

  step("Written vendor/vendor.json");

  // ── 11. Patch package.json ───────────────────────────────────────────────────
  log("Step 11 — Patching package.json");

  const appPkg = readJson<Record<string, unknown>>(APP_PKG_PATH);

  for (const { entry, pkgJson } of resolved) {
    const ref = fileRefMap[entry.name];
    const field = entry.dependencyField;
    const deps = appPkg[field] as Record<string, string> | undefined;

    if (deps && entry.name in deps) {
      step(`  ${entry.name}: ${deps[entry.name]} → ${ref}`);
      deps[entry.name] = ref;
    } else if (entry.transitive) {
      // Inject transitive dep if not already in package.json
      if (!appPkg[field]) appPkg[field] = {};
      (appPkg[field] as Record<string, string>)[entry.name] = ref;
      step(`  ${entry.name}: (transitive) injected → ${ref}`);
    } else {
      warn(`${entry.name} not found in package.json ${field} — skipping patch. Check sources.json.`);
    }
  }

  writeJson(APP_PKG_PATH, appPkg);

  // ── 12. Remove bun.lock ───────────────────────────────────────────────────────
  log("Step 12 — Removing bun.lock");
  const bunLock = join(APP_DIR, "bun.lock");
  if (existsSync(bunLock)) {
    rmSync(bunLock);
    step("Removed bun.lock — run bun install to regenerate");
  } else {
    step("No bun.lock found — skipping");
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║              Summary                     ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`  Monorepo commit: ${gitCommit.slice(0, 12)} (${gitBranch})`);
  console.log(`  Clean:           ${clean ? "✓ yes" : "✗ no (uncommitted changes)"}`);
  console.log(`  Packages packed: ${sorted.length}`);
  console.log(`  Source-only:     ${sourceOnly.length}`);

  if (!clean) {
    console.log(`
  ⚠️  IMPORTANT: vendor was generated from uncommitted package changes.
  
  You can test locally, but you CANNOT commit or push this vendor.
  To fix:
    1. Commit your changes in atproto-packages
    2. Re-run: bun run vendor:generate
  
  See vendor/AGENTS.md for full instructions.`);
  } else {
    console.log(`
  ✓ Next steps:
    bun install          — install dependencies from vendor/
    bun run dev          — start development server`);
  }

  console.log("");
}

main().catch((err) => {
  if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  console.error("\n✗ vendor/generate.ts failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
