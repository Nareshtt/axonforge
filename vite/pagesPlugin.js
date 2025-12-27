import fs from "fs";
import path from "path";

export function pagesPlugin() {
	const PAGES_DIR = path.resolve(process.cwd(), "src/pages");

	function scanPages() {
		const entries = fs.readdirSync(PAGES_DIR, { withFileTypes: true });
		const pages = [{ id: "home", name: "Home" }];

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
			// 👇 WATCH pages directory
			server.watcher.add(PAGES_DIR);

			server.watcher.on("add", (file) => {
				if (file.includes("/src/pages/")) {
					server.ws.send({ type: "full-reload" });
				}
			});

			server.watcher.on("unlink", (file) => {
				if (file.includes("/src/pages/")) {
					server.ws.send({ type: "full-reload" });
				}
			});

			server.middlewares.use("/__pages", (req, res) => {
				const pages = scanPages();
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(pages));
			});
		},
	};
}
