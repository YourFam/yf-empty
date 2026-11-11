import { accessSync, constants, lstatSync, readdirSync, truncateSync } from "node:fs";
import path from "node:path";
import { CliError } from "./errors.js";

/**
 * @typedef {object} Target
 * @property {string} abs
 * @property {string} label
 */

/**
 * @param {string} root
 * @param {string} target
 */
function isInside(root, target) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  if (rel === "") return false;
  if (path.isAbsolute(rel)) return false;
  return !rel.split(path.sep).includes("..");
}

/**
 * @param {string} abs
 * @param {string} label
 */
function assertWritableFile(abs, label) {
  let st;
  try {
    st = lstatSync(abs);
  } catch (err) {
    const code = err && /** @type {{ code?: string }} */ (err).code;
    if (code === "ENOENT") throw new CliError(`File not found: ${label}`);
    throw new CliError(`Cannot read ${label}`);
  }
  if (st.isSymbolicLink()) throw new CliError(`Refusing to empty a symlink: ${label}`);
  if (!st.isFile()) throw new CliError(`Not a file: ${label}`);
  try {
    accessSync(abs, constants.W_OK);
  } catch {
    throw new CliError(`Cannot write ${label}`);
  }
}

/**
 * @param {string} a
 * @param {string} b
 */
function byName(a, b) {
  const cmp = a.localeCompare(b, "en", { sensitivity: "base", numeric: false });
  if (cmp !== 0) return cmp;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Files to empty. Checks every target before the caller truncates any of them.
 * @param {string} folder
 * @param {string[]} names
 * @returns {Target[]}
 */
export function planEmpty(folder, names) {
  const root = path.resolve(folder);
  let rootStat;
  try {
    rootStat = lstatSync(root);
  } catch (err) {
    const code = err && /** @type {{ code?: string }} */ (err).code;
    if (code === "ENOENT") throw new CliError(`Folder not found: ${folder}`);
    throw new CliError(`Cannot read folder: ${folder}`);
  }
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new CliError(`Not a folder: ${folder}`);
  }

  if (names.length === 0) {
    let entries;
    try {
      entries = readdirSync(root, { withFileTypes: true });
    } catch {
      throw new CliError(`Cannot read folder: ${folder}`);
    }
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort(byName);
    return files.map((name) => {
      const abs = path.join(root, name);
      assertWritableFile(abs, name);
      return { abs, label: name };
    });
  }

  /** @type {Target[]} */
  const targets = [];
  const seen = new Set();
  for (const name of names) {
    if (!name) throw new CliError("Missing file name.\nSee yf-empty --help");
    const abs = path.resolve(root, name);
    if (!isInside(root, abs)) throw new CliError(`File is outside the folder: ${name}`);
    assertWritableFile(abs, name);
    const key = process.platform === "win32" ? abs.toLowerCase() : abs;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({
      abs,
      label: path.relative(root, abs).split(path.sep).join("/"),
    });
  }
  return targets;
}

/**
 * @param {Target[]} targets
 */
export function emptyTargets(targets) {
  for (const target of targets) {
    try {
      truncateSync(target.abs, 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new CliError(`Cannot write ${target.label}: ${message}`);
    }
  }
}
