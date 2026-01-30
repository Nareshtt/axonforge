import fs from "fs";
import path from "path";

export function pagesPlugin() {
	const PAGES_DIR = path.resolve(process.cwd(), "src/pages");

	function scanPages() {
		if (!fs.existsSync(PAGES_DIR)) return [];

		const pages = [];

		const rootPagePath = path.join(PAGES_DIR, "page.jsx");
		if (fs.existsSync(rootPagePath)) {
			pages.push({ id: "Home", name: "Home" });
		}

		const entries = fs.readdirSync(PAGES_DIR, { withFileTypes: true });

		for (const e of entries) {
			if (!e.isDirectory()) continue;
			if (fs.existsSync(path.join(PAGES_DIR, e.name, "page.jsx"))) {
				pages.push({ id: e.name, name: e.name });
			}
		}

		return pages;
	}

	return {
		name: "axonforge-pages",

		configureServer(server) {
			server.watcher.add(PAGES_DIR);

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

			// ✅ ONLY handle GET /__pages
			server.middlewares.use("/__pages", (req, res, next) => {
				console.log("[pagesPlugin] middleware hit:", req.method, req.url);

				if (req.method !== "GET" || req.url !== "/") {
					return next(); // let pageBridge handle /__pages/create
				}

				console.log("[pagesPlugin] serving /__pages");

				const pages = scanPages();
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(pages));
			});

			console.log("[pagesPlugin] ✅ initialized");
		},
	};
}
