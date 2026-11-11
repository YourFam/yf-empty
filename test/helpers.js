import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { main } from "../src/index.js";

export function tempDir() {
  return mkdtempSync(path.join(tmpdir(), "yf-empty-"));
}

/**
 * @param {string} dir
 * @param {string} rel
 * @param {string} [content]
 */
export function writeRel(dir, rel, content = "") {
  const abs = path.join(dir, ...rel.split("/"));
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  return abs;
}

/**
 * @param {string} dir
 */
export function remove(dir) {
  rmSync(dir, { recursive: true, force: true });
}

/**
 * @param {string[]} argv
 * @param {string} cwd
 */
export function run(argv, cwd) {
  let out = "";
  let err = "";
  const code = main(["node", "yf-empty", ...argv], {
    cwd,
    log: (msg) => {
      out += `${msg}\n`;
    },
    err: (msg) => {
      err += `${msg}\n`;
    },
  });
  return { code, out, err };
}
