import { readSync } from "node:fs";

/**
 * @param {{ thisFolder: boolean, folder: string | null, files: string[] }} args
 * @param {{ label: string }[]} targets
 */
export function destructiveWarning(args, targets) {
  let what;
  if (args.files.length > 0) {
    const list = targets.map((target) => target.label).join(", ");
    what = `this will empty the given files: ${list}.`;
  } else if (args.thisFolder) {
    what = "this will empty the files in this folder.";
  } else {
    what = `this will empty the files in ${args.folder}.`;
  }
  return `Destructive: ${what}\nPress Y to continue:`;
}

/**
 * Only Y or y continues. yes, empty input, and every other answer do not.
 * @param {string} line
 */
export function answeredYes(line) {
  const answer = line.trim();
  return answer === "Y" || answer === "y";
}

/**
 * Read one line from stdin. Y or y continues. Anything else, including
 * end of input, does not.
 * @param {string} message
 * @returns {boolean}
 */
export function promptYes(message) {
  process.stderr.write(`${message} `);
  const buf = Buffer.alloc(1);
  let line = "";
  for (;;) {
    let n = 0;
    try {
      n = readSync(0, buf, 0, 1, null);
    } catch {
      return false;
    }
    if (n === 0) return false;
    const ch = buf.toString("utf8", 0, n);
    if (ch === "\n") break;
    if (ch !== "\r" && line.length < 32) line += ch;
  }
  return answeredYes(line);
}
