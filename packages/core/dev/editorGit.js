import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const HISTORY_DIR = path.join(ROOT, ".axonforge_history");

function run(cmd) {
	return execSync(cmd, {
		cwd: HISTORY_DIR,
		stdio: "pipe",
		encoding: "utf-8",
	});
}

function ensureRepo() {
	if (!fs.existsSync(HISTORY_DIR)) {
		fs.mkdirSync(HISTORY_DIR);
	}

	if (!fs.existsSync(path.join(HISTORY_DIR, ".git"))) {
		run("git init");
		run("git config user.name AxonForge");
		run("git config user.email editor@axonforge.local");
	}
}

export const editorGit = {
	init() {
		ensureRepo();
	},

	commit(message) {
		try {
			ensureRepo();
			run("git add .");
			run(`git commit -m "${message}"`);
			console.log(`[editor-git] commit: ${message}`);
		} catch {
			// silent by design
		}
	},

	log(limit = 50) {
		ensureRepo();
		return run(`git log --oneline -${limit}`).trim();
	},

	checkout(hash) {
		ensureRepo();
		run(`git checkout ${hash}`);
	},
};
