import fs from "fs";
import path from "path";

export function pageBridge() {
	return {
		name: "page-bridge",
		configureServer(server) {
			const pagesDir = path.resolve(process.cwd(), "src/pages");

			console.log("[pageBridge] ✅ initialized");
			console.log("[pageBridge] 📂 watching:", pagesDir);

			/* ---------- HANDLE RENAME FROM CLIENT ---------- */
			// Listen for custom client messages
			server.ws.on("pages:rename", (data, client) => {
				console.log("[pageBridge] 📨 received message:", data);

				const { from, to } = data;
				const fromPath = path.join(pagesDir, from);
				const toPath = path.join(pagesDir, to);

				console.log(`[pageBridge] 🔔 rename request: "${from}" → "${to}"`);
				console.log(`[pageBridge] 📂 from: ${fromPath}`);
				console.log(`[pageBridge] 📂 to: ${toPath}`);

				if (!fs.existsSync(fromPath)) {
					console.warn(`[pageBridge] ❌ source not found: ${fromPath}`);
					return;
				}

				if (fs.existsSync(toPath)) {
					console.warn(`[pageBridge] ❌ target exists: ${toPath}`);
					return;
				}

				try {
					fs.renameSync(fromPath, toPath);
					console.log(`[pageBridge] ✅ SUCCESS! Renamed folder on disk`);

					// Notify all clients to refresh pages
					const updatedPages = readPages(pagesDir);
					console.log(`[pageBridge] 📤 broadcasting update:`, updatedPages);

					server.ws.send({
						type: "custom",
						event: "pages:update",
						data: updatedPages,
					});
				} catch (err) {
					console.error("[pageBridge] ❌ rename failed:", err.message);
				}
			});

			/* ---------- WATCH FILESYSTEM FOR CHANGES ---------- */
			const watcher = server.watcher;

			watcher.on("addDir", (filePath) => {
				if (path.dirname(filePath) === pagesDir) {
					const folderName = path.basename(filePath);
					console.log("[pageBridge] 📁 folder added:", folderName);

					server.ws.send({
						type: "custom",
						event: "pages:update",
						data: readPages(pagesDir),
					});
				}
			});

			watcher.on("unlinkDir", (filePath) => {
				if (path.dirname(filePath) === pagesDir) {
					const folderName = path.basename(filePath);
					console.log("[pageBridge] 🗑️ folder removed:", folderName);

					server.ws.send({
						type: "custom",
						event: "pages:update",
						data: readPages(pagesDir),
					});
				}
			});
		},
	};
}

/* ---------- READ FILESYSTEM ---------- */
function readPages(dir) {
	if (!fs.existsSync(dir)) {
		console.warn(`[pageBridge] ⚠️ pages directory not found: ${dir}`);
		return [];
	}

	const pages = [];

	// Check for root-level page.jsx (Home page)
	const rootPagePath = path.join(dir, "page.jsx");
	if (fs.existsSync(rootPagePath)) {
		pages.push({ id: "Home", name: "Home" });
	}

	// Scan for folder-based pages
	const folders = fs
		.readdirSync(dir)
		.filter((f) => {
			const fullPath = path.join(dir, f);
			return fs.statSync(fullPath).isDirectory();
		})
		.map((f) => ({
			id: f,
			name: f,
		}));

	return [...pages, ...folders];
}
