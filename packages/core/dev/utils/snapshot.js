import fs from 'fs';
import path from 'path';

const HISTORY_DIR = path.join(process.cwd(), '.axonforge_history');
const PAGES_PATH = path.join(HISTORY_DIR, 'pages.json');

export function writeSnapshot(pages) {
  fs.writeFileSync(PAGES_PATH, JSON.stringify(pages, null, 2));
}

export function readSnapshot() {
  if (!fs.existsSync(PAGES_PATH)) {
    return { pages: [] };
  }

  return {
    pages: JSON.parse(fs.readFileSync(PAGES_PATH, 'utf-8')),
  };
}

export function clearSnapshot() {
  if (fs.existsSync(PAGES_PATH)) {
    fs.unlinkSync(PAGES_PATH);
  }
}
