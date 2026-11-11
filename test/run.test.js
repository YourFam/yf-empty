import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, symlinkSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { remove, run, tempDir, writeRel } from "./helpers.js";

test("bin --version prints the package version", () => {
  const bin = fileURLToPath(new URL("../bin/yf-empty.js", import.meta.url));
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const result = spawnSync(process.execPath, [bin, "--version"], { encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), pkg.version);
});

test("a folder alone empties only the files directly inside it", () => {
  const dir = tempDir();
  try {
    writeRel(dir, "notes/a.txt", "hello");
    writeRel(dir, "notes/b.txt", "there");
    writeRel(dir, "notes/.env", "SECRET=1");
    writeRel(dir, "notes/sub/c.txt", "keep");
    const result = run(["notes"], dir);
    assert.equal(result.code, 0);
    assert.equal(readFileSync(path.join(dir, "notes", "a.txt"), "utf8"), "");
    assert.equal(readFileSync(path.join(dir, "notes", "b.txt"), "utf8"), "");
    assert.equal(readFileSync(path.join(dir, "notes", ".env"), "utf8"), "");
    assert.equal(readFileSync(path.join(dir, "notes", "sub", "c.txt"), "utf8"), "keep");
    assert.match(result.err, /emptied \.env/);
    assert.match(result.err, /emptied a\.txt/);
    assert.match(result.err, /emptied b\.txt/);
    assert.doesNotMatch(result.err, /c\.txt/);
  } finally {
    remove(dir);
  }
});

test("named files are the only ones emptied, including a nested name", () => {
  const dir = tempDir();
  try {
    writeRel(dir, "notes/a.txt", "hello");
    writeRel(dir, "notes/b.txt", "keep");
    writeRel(dir, "notes/sub/c.txt", "nested");
    const result = run(["notes", "a.txt", "sub/c.txt", "a.txt"], dir);
    assert.equal(result.code, 0);
    assert.equal(readFileSync(path.join(dir, "notes", "a.txt"), "utf8"), "");
    assert.equal(readFileSync(path.join(dir, "notes", "b.txt"), "utf8"), "keep");
    assert.equal(readFileSync(path.join(dir, "notes", "sub", "c.txt"), "utf8"), "");
    assert.equal(result.err, "emptied a.txt\nemptied sub/c.txt\n");
  } finally {
    remove(dir);
  }
});

test("a path outside the folder changes nothing", () => {
  const dir = tempDir();
  try {
    writeRel(dir, "outside.txt", "safe");
    writeRel(dir, "notes/a.txt", "hello");
    const result = run(["notes", "../outside.txt"], dir);
    assert.equal(result.code, 1);
    assert.match(result.err, /outside the folder/);
    assert.equal(readFileSync(path.join(dir, "outside.txt"), "utf8"), "safe");
    assert.equal(readFileSync(path.join(dir, "notes", "a.txt"), "utf8"), "hello");
  } finally {
    remove(dir);
  }
});

test("a missing name fails before any file is emptied", () => {
  const dir = tempDir();
  try {
    writeRel(dir, "notes/a.txt", "hello");
    const result = run(["notes", "a.txt", "missing.txt"], dir);
    assert.equal(result.code, 1);
    assert.match(result.err, /File not found: missing\.txt/);
    assert.equal(readFileSync(path.join(dir, "notes", "a.txt"), "utf8"), "hello");
  } finally {
    remove(dir);
  }
});

test("directories and a missing folder are refused", () => {
  const dir = tempDir();
  try {
    writeRel(dir, "notes/a.txt", "hello");
    const asFile = run(["notes", "sub"], dir);
    writeRel(dir, "notes/sub/c.txt", "keep");
    const namedDir = run(["notes", "sub"], dir);
    assert.equal(namedDir.code, 1);
    assert.match(namedDir.err, /Not a file: sub/);
    assert.equal(readFileSync(path.join(dir, "notes", "sub", "c.txt"), "utf8"), "keep");
    assert.equal(asFile.code, 1);

    const missing = run(["nope"], dir);
    assert.equal(missing.code, 1);
    assert.match(missing.err, /Folder not found/);
  } finally {
    remove(dir);
  }
});

test("an empty folder reports zero files", () => {
  const dir = tempDir();
  try {
    writeRel(dir, "notes/sub/c.txt", "keep");
    const result = run(["notes"], dir);
    assert.equal(result.code, 0);
    assert.equal(result.err, "emptied 0 files\n");
    assert.equal(readFileSync(path.join(dir, "notes", "sub", "c.txt"), "utf8"), "keep");
  } finally {
    remove(dir);
  }
});

test("symlinks are refused and the target is left alone", () => {
  const dir = tempDir();
  try {
    writeRel(dir, "notes/real.txt", "keep");
    const link = path.join(dir, "notes", "link.txt");
    try {
      symlinkSync(path.join(dir, "notes", "real.txt"), link, "file");
    } catch (err) {
      const code = err && /** @type {{ code?: string }} */ (err).code;
      if (code === "EPERM" || code === "EACCES") return;
      throw err;
    }
    const named = run(["notes", "link.txt"], dir);
    assert.equal(named.code, 1);
    assert.match(named.err, /symlink/);
    assert.equal(readFileSync(path.join(dir, "notes", "real.txt"), "utf8"), "keep");

    const all = run(["notes"], dir);
    assert.equal(all.code, 0);
    assert.equal(readFileSync(path.join(dir, "notes", "real.txt"), "utf8"), "");
    assert.match(all.err, /emptied real\.txt/);
    assert.doesNotMatch(all.err, /link\.txt/);
  } finally {
    remove(dir);
  }
});
