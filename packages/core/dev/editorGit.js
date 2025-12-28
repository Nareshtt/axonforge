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
			// no-op if nothing changed
		}
	},

	log(limit = 50) {
		ensureRepo();
		return run(`git log --oneline -${limit}`).trim();
	},

	logStructured(limit = 200) {
		ensureRepo();

		try {
			const head = run("git rev-parse HEAD").trim();

			// Get ALL commits from ALL branches
			const raw = run(
				`git log --all --pretty=format:"%H|%P|%s|%ct" --date-order -${limit}`
			)
				.trim()
				.split("\n")
				.filter(Boolean);

			const commits = raw.map((line) => {
				const [hash, parents, message, timestamp] = line.split("|");
				return {
					hash,
					shortHash: hash.slice(0, 7),
					message,
					timestamp: parseInt(timestamp) * 1000,
					parents: parents ? parents.split(" ") : [],
					isHead: hash === head,
				};
			});

			return this.buildTree(commits, head);
		} catch (err) {
			console.error("[editorGit] logStructured failed:", err);
			return [];
		}
	},

	buildTree(commits, head) {
		// Build parent-child relationships
		const commitMap = new Map(
			commits.map((c) => [c.hash, { ...c, children: [] }])
		);

		commits.forEach((commit) => {
			commit.parents.forEach((parentHash) => {
				const parent = commitMap.get(parentHash);
				if (parent) {
					parent.children.push(commit.hash);
				}
			});
		});

		// Find root commit
		const root = commits.find((c) => c.parents.length === 0);
		if (!root) return [];

		// Traverse tree to assign positions
		const positioned = [];
		const traverse = (hash, branch = 0, depth = 0) => {
			const commit = commitMap.get(hash);
			if (!commit || positioned.find((p) => p.hash === hash)) return;

			positioned.push({
				...commit,
				branch,
				depth,
			});

			// Handle children
			if (commit.children.length === 0) return;

			// First child continues on same branch
			traverse(commit.children[0], branch, depth + 1);

			// Additional children create new branches
			commit.children.slice(1).forEach((childHash, i) => {
				traverse(childHash, branch + i + 1, depth + 1);
			});
		};

		traverse(root.hash);

		return positioned;
	},

	checkout(hash) {
		ensureRepo();
		try {
			run(`git checkout ${hash}`);
			console.log(`[editor-git] checked out: ${hash}`);
		} catch (err) {
			console.error(`[editor-git] checkout failed:`, err.message);
			throw err;
		}
	},

	// Create a new branch from a commit
	createBranch(hash, branchName) {
		ensureRepo();
		try {
			run(`git checkout ${hash}`);
			run(`git checkout -b ${branchName}`);
			console.log(`[editor-git] created branch: ${branchName} from ${hash}`);
		} catch (err) {
			console.error(`[editor-git] create branch failed:`, err.message);
			throw err;
		}
	},

	reset(hash) {
		ensureRepo();
		try {
			run(`git reset --hard ${hash}`);
			console.log(`[editor-git] reset to: ${hash}`);
		} catch (err) {
			console.error(`[editor-git] reset failed:`, err.message);
			throw err;
		}
	},

	revert(hash) {
		ensureRepo();
		try {
			run(`git revert ${hash} --no-edit`);
			console.log(`[editor-git] reverted: ${hash}`);
		} catch (err) {
			console.error(`[editor-git] revert failed:`, err.message);
			throw err;
		}
	},

	// Clear all commits and start fresh
	clearAll() {
		ensureRepo();
		try {
			// Remove .git directory
			const gitDir = path.join(HISTORY_DIR, ".git");
			if (fs.existsSync(gitDir)) {
				fs.rmSync(gitDir, { recursive: true, force: true });
			}

			// Reinitialize
			this.init();
			console.log(`[editor-git] cleared all history`);
		} catch (err) {
			console.error(`[editor-git] clear all failed:`, err.message);
			throw err;
		}
	},

	status() {
		ensureRepo();
		try {
			return run("git rev-parse HEAD").trim();
		} catch {
			return null;
		}
	},

	getCurrentBranch() {
		ensureRepo();
		try {
			return run("git rev-parse --abbrev-ref HEAD").trim();
		} catch {
			return "main";
		}
	},
};
