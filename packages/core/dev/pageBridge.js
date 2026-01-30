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

			/* ---------- CREATE PAGE ---------- */
			server.middlewares.use("/__pages/create", (req, res, next) => {
				if (req.method !== "POST") return next();

				let body = "";
				req.on("data", (c) => (body += c));
				req.on("end", () => {
					try {
						const { name } = JSON.parse(body);

						console.log("[pageBridge] Create page request:", name);

						if (!name) {
							res.writeHead(400);
							res.end(JSON.stringify({ error: "Page name required" }));
							return;
						}

						const safeName = name.trim();
						const pageFolder = path.join(pagesDir, safeName);
						const pageFile = path.join(pageFolder, "page.jsx");

						if (fs.existsSync(pageFolder)) {
							res.writeHead(400);
							res.end(JSON.stringify({ error: "Page already exists" }));
							return;
						}

						// Create folder
						fs.mkdirSync(pageFolder, { recursive: true });

						const template = `export default function Page() {
	return (
		<div className="w-full h-full flex items-center justify-center bg-black">
		</div>
	);
}
`;

						fs.writeFileSync(pageFile, template);

						console.log(`[pageBridge] Page created: ${safeName}`);

						const pages = readPages(pagesDir);
						writeSnapshot({ pages });

						// Git commit
						try {
							const currentHash = editorGit.status();

							if (currentHash) {
								const branch = editorGit.getCurrentBranch();
								if (branch === "HEAD") {
									const branchName = `branch-${Date.now()}`;
									console.log(
										`[pageBridge] Creating branch ${branchName} from detached HEAD`
									);
									editorGit.createBranch(currentHash, branchName);
								}
							}

							editorGit.commit(`Add page "${safeName}"`);
						} catch (err) {
							console.warn("[pageBridge] Git commit warning:", err.message);
						}

						server.ws.send({
							type: "custom",
							event: "pages:update",
							data: pages,
						});

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({ success: true }));
					} catch (err) {
						console.error("[pageBridge] Create page failed:", err);
						res.writeHead(500, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ error: err.message }));
					}
				});
			});

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

						console.log(`[timeline] RESET OPERATION STARTING`);

						editorGit.reset(hash);

						const snapshot = readSnapshot();

						if (snapshot && snapshot.pages) {
							applySnapshotToProject(snapshot.pages);
						}

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({ success: true, snapshot }));
					} catch (err) {
						console.error("[timeline] reset failed:", err);
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

					editorGit.clearAll();

					const snapshotPath = path.join(
						process.cwd(),
						".axonforge_history",
						"pages.json"
					);
					if (fs.existsSync(snapshotPath)) {
						fs.unlinkSync(snapshotPath);
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
			/* ---------- DELETE PAGE ---------- */
			server.middlewares.use("/__pages/delete", (req, res, next) => {
				if (req.method !== "POST") return next();

				let body = "";
				req.on("data", (c) => (body += c));
				req.on("end", () => {
					try {
						const { name } = JSON.parse(body);

						console.log("[pageBridge] Delete page request:", name);

						const targetPath = path.join(pagesDir, name);

						if (!fs.existsSync(targetPath)) {
							res.writeHead(404);
							res.end(JSON.stringify({ error: "Page not found" }));
							return;
						}

						fs.rmSync(targetPath, { recursive: true, force: true });

						const pages = readPages(pagesDir);
						writeSnapshot({ pages });

						try {
							editorGit.commit(`Delete page "${name}"`);
						} catch (err) {
							console.warn("[pageBridge] Git commit warning:", err.message);
						}

						server.ws.send({
							type: "custom",
							event: "pages:update",
							data: pages,
						});

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({ success: true }));
					} catch (err) {
						console.error("[pageBridge] Delete page failed:", err);
						res.writeHead(500);
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

				if (!fs.existsSync(fromPath)) return;
				if (fs.existsSync(toPath)) return;

				try {
					fs.renameSync(fromPath, toPath);
					console.log(`[pageBridge] Filesystem rename successful`);
				} catch (err) {
					console.error(`[pageBridge] Rename failed:`, err);
					return;
				}

				const pages = readPages(pagesDir);
				writeSnapshot({ pages });

				try {
					const currentHash = editorGit.status();
					if (currentHash) {
						const branch = editorGit.getCurrentBranch();
						if (branch === "HEAD") {
							const branchName = `branch-${Date.now()}`;
							editorGit.createBranch(currentHash, branchName);
						}
					}

					editorGit.commit(`Rename page "${from}" → "${to}"`);
				} catch (err) {
					console.warn("[pageBridge] Git commit warning:", err.message);
				}

				server.ws.send({
					type: "custom",
					event: "pages:update",
					data: pages,
				});
			});

			/* ---------- WATCH FS ---------- */
			const watcher = server.watcher;

			watcher.on("addDir", (filePath) => {
				if (path.dirname(filePath) !== pagesDir) return;

				const pages = readPages(pagesDir);
				writeSnapshot({ pages });
				const pageName = path.basename(filePath);

				try {
					editorGit.commit(`Add page "${pageName}"`);
				} catch {}

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

				try {
					editorGit.commit(`Delete page "${pageName}"`);
				} catch {}

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
