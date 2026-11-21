import assert from "node:assert/strict";
import { test } from "node:test";
import { answeredYes, destructiveWarning } from "../src/confirm.js";

test("only Y continues", () => {
  assert.equal(answeredYes("Y"), true);
  assert.equal(answeredYes("y"), true);
  assert.equal(answeredYes(" Y "), true);
  assert.equal(answeredYes("n"), false);
  assert.equal(answeredYes("yes"), false);
  assert.equal(answeredYes(""), false);
});

test("warning names the folder, this folder, or the given files", () => {
  assert.match(
    destructiveWarning({ thisFolder: false, folder: "notes", files: [] }, []),
    /this will empty the files in notes\./,
  );
  assert.match(
    destructiveWarning({ thisFolder: true, folder: ".", files: [] }, []),
    /this will empty the files in this folder\./,
  );
  assert.match(
    destructiveWarning({ thisFolder: false, folder: "notes", files: ["a.txt"] }, [{ label: "a.txt" }]),
    /this will empty the given files: a\.txt\./,
  );
});
