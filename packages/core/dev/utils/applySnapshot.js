import fs from 'fs';
import path from 'path';

export function applySnapshotToProject(snapshotPages) {
  const pagesDir = path.resolve(process.cwd(), 'src/pages');

  if (!fs.existsSync(pagesDir)) {
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
    .filter((p) => p.id !== 'Home')
    .map((p) => p.id);

  // Delete extra folders not in snapshot
  for (const folder of diskFolders) {
    if (!snapshotFolders.includes(folder)) {
      fs.rmSync(path.join(pagesDir, folder), {
        recursive: true,
        force: true,
      });
    }
  }

  // Create missing folders
  for (const folder of snapshotFolders) {
    const target = path.join(pagesDir, folder);
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });

      const pageFile = path.join(target, 'page.jsx');
      if (!fs.existsSync(pageFile)) {
        fs.writeFileSync(
          pageFile,
          `export default function Page() {\n  return <div>${folder}</div>;\n}\n`
        );
      }
    }
  }
}
