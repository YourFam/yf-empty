import assert from "node:assert/strict";
import { test } from "node:test";
import { helpText, parseArgs } from "../src/args.js";
import { CliError } from "../src/errors.js";

const sh = (...rest) => ["node", "yf-empty", ...rest];

test("folder and file names", () => {
  const args = parseArgs(sh("notes", "a.txt", "draft/b.txt"));
  assert.equal(args.folder, "notes");
  assert.deepEqual(args.files, ["a.txt", "draft/b.txt"]);
});

test("help and version do not require a folder", () => {
  assert.equal(parseArgs(sh("--help")).help, true);
  assert.equal(parseArgs(sh("-h")).help, true);
  assert.equal(parseArgs(sh("--version")).version, true);
  assert.equal(parseArgs(sh("-V")).version, true);
  assert.equal(parseArgs(sh("--", "--weird")).folder, "--weird");
});

test("missing folder and unknown flag", () => {
  assert.throws(() => parseArgs(sh()), (err) => err instanceof CliError && /Missing folder/.test(err.message));
  assert.throws(() => parseArgs(sh("--nope")), (err) => err instanceof CliError && /Unknown flag/.test(err.message));
});

test("help names the command", () => {
  const text = helpText();
  assert.match(text, /^yf-empty /);
  assert.match(text, /subfolders are left alone/i);
  assert.match(text, /symlink/i);
  assert.match(text, /does not|Git is not changed/);
});
