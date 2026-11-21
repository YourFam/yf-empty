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
 * @param {{ confirm?: (message: string) => boolean, isTTY?: () => boolean }} [options]
 */
export function run(argv, cwd, options = {}) {
  let out = "";
  let err = "";
  /** @type {string[]} */
  const prompts = [];
  const code = main(["node", "yf-empty", ...argv], {
    cwd,
    log: (msg) => {
      out += `${msg}\n`;
    },
    err: (msg) => {
      err += `${msg}\n`;
    },
    isTTY: options.isTTY ?? (() => true),
    confirm: (message) => {
      prompts.push(message);
      if (options.confirm) return options.confirm(message);
      throw new Error("confirm called; pass --y or a confirm stub");
    },
  });
  return { code, out, err, prompts };
}
