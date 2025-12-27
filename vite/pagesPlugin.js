import fs from "fs";
import path from "path";

export function pagesPlugin() {
	const PAGES_DIR = path.resolve(process.cwd(), "src/pages");

	function scanPages() {
		if (!fs.existsSync(PAGES_DIR)) {
			return [];
		}

		const pages = [];

		// 👇 Check for root-level page.jsx (Home page)
		const rootPagePath = path.join(PAGES_DIR, "page.jsx");
		if (fs.existsSync(rootPagePath)) {
			pages.push({ id: "Home", name: "Home" });
		}

		// 👇 Scan for folder-based pages
		const entries = fs.readdirSync(PAGES_DIR, { withFileTypes: true });

		for (const e of entries) {
			if (!e.isDirectory()) continue;
			// Only include pages that have a page.jsx file
			if (fs.existsSync(path.join(PAGES_DIR, e.name, "page.jsx"))) {
				pages.push({ id: e.name, name: e.name });
			}
		}

		return pages;
	}

	return {
		name: "axonforge-pages",

		configureServer(server) {
			// 👇 WATCH pages directory
			server.watcher.add(PAGES_DIR);

			// Only reload on file add/delete, not on folder rename
			// (folder rename is handled by pageBridge)
			server.watcher.on("add", (file) => {
				if (file.includes("/src/pages/") && file.endsWith("page.jsx")) {
					console.log("[pagesPlugin] 📄 page.jsx added, reloading...");
					server.ws.send({ type: "full-reload" });
				}
			});

			server.watcher.on("unlink", (file) => {
				if (file.includes("/src/pages/") && file.endsWith("page.jsx")) {
					console.log("[pagesPlugin] 🗑️ page.jsx removed, reloading...");
					server.ws.send({ type: "full-reload" });
				}
			});

			// Serve pages list
			server.middlewares.use("/__pages", (req, res) => {
				const pages = scanPages();
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(pages));
			});

			console.log("[pagesPlugin] ✅ initialized");
		},
	};
}
