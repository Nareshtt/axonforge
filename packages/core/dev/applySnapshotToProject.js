import fs from "fs";
import path from "path";

export function applySnapshotToProject(snapshotPages) {
	const pagesDir = path.resolve(process.cwd(), "src/pages");

	if (!fs.existsSync(pagesDir)) {
		console.warn("src/pages does not exist, creating it");
		fs.mkdirSync(pagesDir, { recursive: true });
	}

	const diskFolders = fs.readdirSync(pagesDir).filter((f) => {
		const fullPath = path.join(pagesDir, f);
		try {
			return fs.statSync(fullPath).isDirectory();
		} catch {
			return false;
		}
	});

	const snapshotFolders = snapshotPages
		.filter((p) => p.id !== "Home")
		.map((p) => p.id);

	/* ---------- DELETE EXTRA FOLDERS ---------- */
	for (const folder of diskFolders) {
		if (!snapshotFolders.includes(folder)) {
			console.log(`[applySnapshot] Removing folder: ${folder}`);
			try {
				fs.rmSync(path.join(pagesDir, folder), {
					recursive: true,
					force: true,
				});
			} catch (err) {
				console.error(
					`[applySnapshot] Failed to remove ${folder}:`,
					err.message
				);
			}
		}
	}

	/* ---------- CREATE MISSING FOLDERS ---------- */
	for (const folder of snapshotFolders) {
		const target = path.join(pagesDir, folder);
		if (!fs.existsSync(target)) {
			console.log(`[applySnapshot] Creating folder: ${folder}`);
			fs.mkdirSync(target, { recursive: true });

			// Create placeholder page.jsx if missing
			const pageFile = path.join(target, "page.jsx");
			if (!fs.existsSync(pageFile)) {
				fs.writeFileSync(
					pageFile,
					`export default function Page() {\n  return <div>${folder}</div>;\n}\n`
				);
			}
		}
	}

	console.log(
		`[applySnapshot] ✅ Applied snapshot with ${snapshotPages.length} pages`
	);
}
