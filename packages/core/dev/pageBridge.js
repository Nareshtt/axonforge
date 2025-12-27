import fs from "fs";
import path from "path";
import { editorGit } from "./editorGit";
import { writeSnapshot } from "./editorSnapshot";

export function pageBridge() {
	return {
		name: "page-bridge",
		configureServer(server) {
			const rootDir = process.cwd();
			const pagesDir = path.resolve(rootDir, "src/pages");

			/* ---------- INIT EDITOR GIT ---------- */
			editorGit.init();

			console.log("[pageBridge] ✅ initialized");
			console.log("[pageBridge] 📂 watching:", pagesDir);

			/* ---------- HANDLE RENAME ---------- */
			server.ws.on("pages:rename", (data) => {
				const { from, to } = data;

				const fromPath = path.join(pagesDir, from);
				const toPath = path.join(pagesDir, to);

				if (!fs.existsSync(fromPath) || fs.existsSync(toPath)) return;

				fs.renameSync(fromPath, toPath);

				const pages = readPages(pagesDir);

				writeSnapshot({ pages });
				editorGit.commit(`Rename page "${from}" → "${to}"`);

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
				editorGit.commit("Add page");

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
				editorGit.commit("Delete page");

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
