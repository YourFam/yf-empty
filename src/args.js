import { CliError } from "./errors.js";

/**
 * @typedef {object} ParsedArgs
 * @property {boolean} help
 * @property {boolean} version
 * @property {string | null} folder
 * @property {string[]} files
 */

/**
 * @param {string[]} argv process.argv
 * @returns {ParsedArgs}
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  let help = false;
  let version = false;
  /** @type {string[]} */
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--") {
      positionals.push(...args.slice(i + 1));
      break;
    }
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--version" || arg === "-V") {
      version = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new CliError(`Unknown flag: ${arg}\nSee yf-empty --help`);
    }
    positionals.push(arg);
  }

  if (!help && !version && positionals.length === 0) {
    throw new CliError("Missing folder.\nSee yf-empty --help");
  }

  return {
    help,
    version,
    folder: positionals[0] ?? null,
    files: positionals.slice(1),
  };
}

export function helpText() {
  return `yf-empty — empty file contents and leave the files in place

Usage:
  yf-empty <folder> [file...]

With only a folder, every file directly in that folder is emptied.
Files in subfolders are left alone.
With file names, only those files are emptied. A name is relative to
the folder, so notes/a.txt is allowed. A path outside the folder is refused.

Symlinks are refused, so a shortcut is not followed into another file.
Directories are not removed. Git is not changed. Commit yourself if you
want the empty files recorded.

The folder is required, so this never blanks the current directory unless
you pass it. Node 20+.`.trim();
}
