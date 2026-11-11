import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { helpText, parseArgs } from "./args.js";
import { emptyTargets, planEmpty } from "./empty.js";
import { CliError } from "./errors.js";

const pkg = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"),
);

function defaultDeps() {
  return {
    cwd: process.cwd(),
    version: pkg.version,
    log: (msg) => console.log(msg),
    err: (msg) => console.error(msg),
  };
}

/**
 * @param {ReturnType<typeof parseArgs>} args
 * @param {ReturnType<typeof defaultDeps>} deps
 */
function execute(args, deps) {
  if (args.help) {
    deps.log(helpText());
    return 0;
  }
  if (args.version) {
    deps.log(deps.version);
    return 0;
  }

  const folder = path.resolve(deps.cwd, args.folder);
  const targets = planEmpty(folder, args.files);
  emptyTargets(targets);
  if (targets.length === 0) {
    deps.err("emptied 0 files");
    return 0;
  }
  for (const target of targets) deps.err(`emptied ${target.label}`);
  return 0;
}

/**
 * @param {string[]} argv
 * @param {Partial<ReturnType<typeof defaultDeps>>} [overrides]
 * @returns {number}
 */
export function main(argv, overrides = {}) {
  const deps = { ...defaultDeps(), ...overrides };
  try {
    return execute(parseArgs(argv), deps);
  } catch (err) {
    if (err instanceof CliError) {
      deps.err(err.message);
      return err.exitCode ?? 1;
    }
    throw err;
  }
}

/**
 * @param {string[]} argv
 */
export function run(argv) {
  try {
    process.exit(main(argv));
  } catch (err) {
    const message = err instanceof Error && err.message ? err.message : String(err);
    console.error(message);
    process.exit(err instanceof CliError ? err.exitCode : 1);
  }
}
