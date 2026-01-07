import fs from "fs";
import path from "path";
import { editorGit } from "./editorGit";
import { writeSnapshot, readSnapshot } from "./editorSnapshot";
import { applySnapshotToProject } from "./applySnapshotToProject";

export function pageBridge() {
	return {
		name: "page-bridge",
		configureServer(server) {
			const rootDir = process.cwd();
			const pagesDir = path.resolve(rootDir, "src/pages");

			/* ---------- INIT ---------- */
			editorGit.init();

			console.log("[pageBridge] ✅ initialized");
			console.log("[pageBridge] 📂 watching:", pagesDir);

			/* ---------- TIMELINE: LIST ---------- */
			server.middlewares.use("/__timeline", (req, res, next) => {
				if (req.method !== "GET") return next();

				const commits = editorGit.logStructured(200);
				const head = editorGit.status();

				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ commits, head }));
			});

			/* ---------- TIMELINE: CHECKOUT ---------- */
			server.middlewares.use("/__timeline/checkout", (req, res, next) => {
				if (req.method !== "POST") return next();

				let body = "";
				req.on("data", (c) => (body += c));
				req.on("end", () => {
					try {
						const { hash } = JSON.parse(body);

						console.log(`[timeline] Checking out commit: ${hash}`);
						editorGit.checkout(hash);

						const snapshot = readSnapshot();

						// Apply the snapshot to the actual project files
						if (snapshot && snapshot.pages) {
							console.log(
								`[timeline] Applying snapshot with ${snapshot.pages.length} pages`
							);
							applySnapshotToProject(snapshot.pages);
						}

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({ success: true, snapshot }));
					} catch (err) {
						console.error("[timeline] checkout failed:", err);
						res.writeHead(500, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ error: err.message }));
					}
				});
			});

			/* ---------- TIMELINE: RESET ---------- */
			server.middlewares.use("/__timeline/reset", (req, res, next) => {
				if (req.method !== "POST") return next();

				let body = "";
				req.on("data", (c) => (body += c));
				req.on("end", () => {
					try {
						const { hash } = JSON.parse(body);

						console.log(`[timeline] ========================================`);
						console.log(`[timeline] RESET OPERATION STARTING`);
						console.log(`[timeline] Target commit hash: ${hash}`);

						// First, get current state
						const beforeCommits = editorGit.logStructured(200);
						console.log(
							`[timeline] Commits before reset: ${beforeCommits.length}`
						);

						// Perform the reset
						editorGit.reset(hash);
						console.log(`[timeline] Git reset completed`);

						// Verify the reset
						const afterCommits = editorGit.logStructured(200);
						console.log(
							`[timeline] Commits after reset: ${afterCommits.length}`
						);

						// Read and apply the snapshot
						const snapshot = readSnapshot();
						console.log(
							`[timeline] Snapshot read with ${
								snapshot.pages?.length || 0
							} pages`
						);

						// Apply the snapshot to the filesystem
						if (snapshot && snapshot.pages) {
							applySnapshotToProject(snapshot.pages);
							console.log(`[timeline] Snapshot applied to project`);
						}

						console.log(`[timeline] RESET OPERATION COMPLETED`);
						console.log(`[timeline] ========================================`);

						res.setHeader("Content-Type", "application/json");
						res.end(
							JSON.stringify({
								success: true,
								snapshot,
								beforeCount: beforeCommits.length,
								afterCount: afterCommits.length,
							})
						);
					} catch (err) {
						console.error(
							"[timeline] ========================================"
						);
						console.error("[timeline] RESET OPERATION FAILED");
						console.error("[timeline] Error:", err);
						console.error("[timeline] Stack:", err.stack);
						console.error(
							"[timeline] ========================================"
						);
						res.writeHead(500, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ error: err.message }));
					}
				});
			});

			/* ---------- TIMELINE: REVERT ---------- */
			server.middlewares.use("/__timeline/revert", (req, res, next) => {
				if (req.method !== "POST") return next();

				let body = "";
				req.on("data", (c) => (body += c));
				req.on("end", () => {
					try {
						const { hash } = JSON.parse(body);

						console.log(`[timeline] Reverting commit: ${hash}`);
						editorGit.revert(hash);

						const snapshot = readSnapshot();

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({ success: true, snapshot }));
					} catch (err) {
						console.error("[timeline] revert failed:", err);
						res.writeHead(500, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ error: err.message }));
					}
				});
			});

			/* ---------- TIMELINE: CLEAR ALL ---------- */
			server.middlewares.use("/__timeline/clear", (req, res, next) => {
				if (req.method !== "POST") return next();

				try {
					console.log(`[timeline] Clearing all history`);

					// Clear all git history
					editorGit.clearAll();

					// Clear the snapshot file
					const snapshotPath = path.join(
						process.cwd(),
						".axonforge_history",
						"pages.json"
					);
					if (fs.existsSync(snapshotPath)) {
						fs.unlinkSync(snapshotPath);
						console.log(`[timeline] Cleared snapshot file`);
					}

					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({ success: true }));
				} catch (err) {
					console.error("[timeline] clear all failed:", err);
					res.writeHead(500, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: err.message }));
				}
			});

			/* ---------- TIMELINE: CREATE BRANCH ---------- */
			server.middlewares.use("/__timeline/create-branch", (req, res, next) => {
				if (req.method !== "POST") return next();

				let body = "";
				req.on("data", (c) => (body += c));
				req.on("end", () => {
					try {
						const { hash, branchName } = JSON.parse(body);

						console.log(
							`[timeline] Creating branch ${branchName} from ${hash}`
						);
						editorGit.createBranch(hash, branchName);

						const snapshot = readSnapshot();

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({ success: true, snapshot }));
					} catch (err) {
						console.error("[timeline] create branch failed:", err);
						res.writeHead(500, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ error: err.message }));
					}
				});
			});

			/* ---------- APPLY SNAPSHOT ---------- */
			server.middlewares.use("/__timeline/apply", (req, res, next) => {
				if (req.method !== "POST") return next();

				let body = "";
				req.on("data", (c) => (body += c));
				req.on("end", () => {
					try {
						const { hash } = JSON.parse(body);

						console.log(`[timeline] Applying snapshot from ${hash}`);
						editorGit.checkout(hash);
						const snapshot = readSnapshot();

						if (snapshot && snapshot.pages) {
							applySnapshotToProject(snapshot.pages);
						}

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({ success: true }));
					} catch (err) {
						console.error("[timeline] apply failed:", err);
						res.writeHead(500, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ error: err.message }));
					}
				});
			});

			/* ---------- PAGE RENAME ---------- */
			server.ws.on("pages:rename", (data) => {
				const { from, to } = data;

				console.log(`[pageBridge] Renaming page: "${from}" → "${to}"`);

				const fromPath = path.join(pagesDir, from);
				const toPath = path.join(pagesDir, to);

				// Validation
				if (!fs.existsSync(fromPath)) {
					console.error(`[pageBridge] Source path does not exist: ${fromPath}`);
					return;
				}

				if (fs.existsSync(toPath)) {
					console.error(`[pageBridge] Target path already exists: ${toPath}`);
					return;
				}

				// Perform the rename
				try {
					fs.renameSync(fromPath, toPath);
					console.log(`[pageBridge] Filesystem rename successful`);
				} catch (err) {
					console.error(`[pageBridge] Filesystem rename failed:`, err);
					return;
				}

				// Update snapshot
				const pages = readPages(pagesDir);
				writeSnapshot({ pages });

				// Handle git commit (only if we have commits)
				try {
					const currentHash = editorGit.status();

					if (currentHash) {
						// We have commits, check branch state
						const branch = editorGit.getCurrentBranch();
						if (branch === "HEAD") {
							// We're in detached HEAD, create a new branch
							const branchName = `branch-${Date.now()}`;
							console.log(
								`[pageBridge] Creating branch ${branchName} from detached HEAD`
							);
							editorGit.createBranch(currentHash, branchName);
						}
					}

					// Commit the change
					editorGit.commit(`Rename page "${from}" → "${to}"`);
				} catch (err) {
					console.warn("[pageBridge] Git commit warning:", err.message);
					// Don't fail the rename if git fails
				}

				// Notify client
				server.ws.send({
					type: "custom",
					event: "pages:update",
					data: pages,
				});

				console.log(`[pageBridge] Rename completed successfully`);
			});

			/* ---------- WATCH FS ---------- */
			const watcher = server.watcher;

			watcher.on("addDir", (filePath) => {
				if (path.dirname(filePath) !== pagesDir) return;

				const pages = readPages(pagesDir);
				writeSnapshot({ pages });
				const pageName = path.basename(filePath);

				// Handle git commit (only if we have commits)
				try {
					const currentHash = editorGit.status();

					if (currentHash) {
						// We have commits, check branch state
						const branch = editorGit.getCurrentBranch();
						if (branch === "HEAD") {
							// We're in detached HEAD, create a new branch
							const branchName = `branch-${Date.now()}`;
							console.log(
								`[pageBridge] Creating branch ${branchName} from detached HEAD`
							);
							editorGit.createBranch(currentHash, branchName);
						}
					}

					editorGit.commit(`Add page "${pageName}"`);
				} catch (err) {
					console.warn("[pageBridge] Git commit warning:", err.message);
				}

				server.ws.send({
					type: "custom",
					event: "pages:update",
					data: pages,
				});
			});

			watcher.on("unlinkDir", (filePath) => {
				if (path.dirname(filePath) !== pagesDir) return;

				const pages = readPages(pagesDir);
				writeSnapshot({ pages });
				const pageName = path.basename(filePath);

				// Handle git commit (only if we have commits)
				try {
					const currentHash = editorGit.status();

					if (currentHash) {
						// We have commits, check branch state
						const branch = editorGit.getCurrentBranch();
						if (branch === "HEAD") {
							// We're in detached HEAD, create a new branch
							const branchName = `branch-${Date.now()}`;
							console.log(
								`[pageBridge] Creating branch ${branchName} from detached HEAD`
							);
							editorGit.createBranch(currentHash, branchName);
						}
					}

					editorGit.commit(`Delete page "${pageName}"`);
				} catch (err) {
					console.warn("[pageBridge] Git commit warning:", err.message);
				}

				server.ws.send({
					type: "custom",
					event: "pages:update",
					data: pages,
				});
			});
		},
	};
}

/* ---------- READ FILESYSTEM ---------- */
function readPages(dir) {
	const pages = [];

	const rootPagePath = path.join(dir, "page.jsx");
	if (fs.existsSync(rootPagePath)) {
		pages.push({ id: "Home", name: "Home" });
	}

	const folders = fs
		.readdirSync(dir)
		.filter((f) => fs.statSync(path.join(dir, f)).isDirectory())
		.map((f) => ({ id: f, name: f }));

	return [...pages, ...folders];
}
