import { CliError } from "./errors.js";

/**
 * @typedef {object} ParsedArgs
 * @property {boolean} help
 * @property {boolean} version
 * @property {boolean} thisFolder
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
  let thisFolder = false;
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
    if (arg === "--this-folder") {
      thisFolder = true;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new CliError(`Unknown flag: ${arg}\nSee yf-empty --help`);
    }
    positionals.push(arg);
  }

  if (thisFolder && positionals.length > 0 && !help && !version) {
    throw new CliError("--this-folder does not take a folder name.\nSee yf-empty --help");
  }

  if (!help && !version && !thisFolder && positionals.length === 0) {
    throw new CliError("Missing folder.\nSee yf-empty --help");
  }

  return {
    help,
    version,
    thisFolder,
    folder: thisFolder ? "." : (positionals[0] ?? null),
    files: thisFolder ? [] : positionals.slice(1),
  };
}

export function helpText() {
  return `yf-empty — empty file contents and leave the files in place

Usage:
  yf-empty <folder> [file...]
  yf-empty --this-folder

With only a folder, every file directly in that folder is emptied.
Files in subfolders are left alone.
With file names, only those files are emptied. A name is relative to
the folder, so notes/a.txt is allowed. A path outside the folder is refused.

--this-folder empties the files in the directory where you run the command.
It does not take a folder name.

Symlinks are refused, so a shortcut is not followed into another file.
Directories are not removed. Git is not changed. Commit yourself if you
want the empty files recorded.

A folder or --this-folder is required. Node 20+.`.trim();
}
