# yf-empty

Empty file contents and leave the files in place.

Pass a folder to blank every file directly in it, or a folder and file names to blank only those. Tracked files and gitignored files are both fine. The tool does not commit. Node 20+.

- **Source / README:** https://github.com/YourFam/yf-empty
- **npm:** https://www.npmjs.com/package/@yourfam/yf-empty
- **Unscoped alias:** https://www.npmjs.com/package/yf-git-empty
- **Issues:** https://github.com/YourFam/yf-empty/issues

## Install

```bash
npm install -g @yourfam/yf-empty
```

Then from any directory:

```bash
yf-empty path/to/folder
```

The command is `yf-empty`. No install:

```bash
npx @yourfam/yf-empty path/to/folder
npx yf-git-empty path/to/folder
```

`npx yf-git-empty` is the unscoped alias of `@yourfam/yf-empty` (same CLI, same version). npm may reject unscoped `yf-empty` as too similar to an existing package. After `-g`, the command is `yf-empty`.

| | `npm install -g @yourfam/yf-empty` | `npm install -D @yourfam/yf-empty` |
|---|---|---|
| Where it goes | Global npm prefix | `node_modules/` of the current repo |
| Command | `yf-empty` from any folder | `npx yf-empty` in that repo |
| Typical use | A CLI you want everywhere | A tool this repo runs in scripts |

With `-D`, plain `yf-empty` is not on your PATH. Use `npx yf-empty`.

## Usage

```bash
yf-empty <folder> [file...]
```

```bash
yf-empty notes
yf-empty notes a.txt b.txt
yf-empty notes draft/a.txt
```

A folder alone empties every file sitting directly in that folder. Files in subfolders stay as they are. Dotfiles in that folder are included.

File names are relative to the folder. Only those files are emptied. `../secret.txt` is refused. A missing name fails the command before any file is changed.

Symlinks are refused, so a shortcut is not followed into another file. Directories are not removed. Git is not read and not changed. If the empty files should be recorded, commit them yourself.

The folder is required. `yf-empty` with no arguments prints an error instead of blanking the current directory.

Each emptied file is printed to stderr as `emptied a.txt`. An empty folder prints `emptied 0 files`.

## Development

```bash
git clone https://github.com/YourFam/yf-empty.git
cd yf-empty
npm test
node ./bin/yf-empty.js --help
```

Maintainer: YourFam (`kamal-yourfam` on npm). MIT.

## Publish the unscoped alias (maintainers)

The GitHub repo publishes two npm packages at the same version:

1. `npm publish --access public` from the repo root → `@yourfam/yf-empty`
2. Then from `alias/`, with matching `version` and `dependencies["@yourfam/yf-empty"]`:

```bash
cd alias
npm publish --access public
```

That second package is named `yf-git-empty` and only shims the scoped CLI so `npx yf-git-empty` cannot be squatted.

## License

MIT © 2026 YourFam. See [LICENSE](./LICENSE).
