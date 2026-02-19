import fs from 'fs';
import path from 'path';

export function readPages(dir) {
  const pages = [];

  const rootPagePath = path.join(dir, 'page.jsx');
  if (fs.existsSync(rootPagePath)) {
    pages.push({ id: 'Home', name: 'Home' });
  }

  const folders = fs
    .readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isDirectory())
    .map((f) => ({ id: f, name: f }));

  return [...pages, ...folders];
}

export function getPageTemplate(pageName) {
  return `export default function Page() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <h1>${pageName}</h1>
    </div>
  );
}
`;
}

export function createPageFolder(pagesDir, pageName) {
  const pageFolder = path.join(pagesDir, pageName);
  const pageFile = path.join(pageFolder, 'page.jsx');

  if (fs.existsSync(pageFolder)) {
    return { success: false, error: 'Page already exists' };
  }

  fs.mkdirSync(pageFolder, { recursive: true });
  fs.writeFileSync(pageFile, getPageTemplate(pageName));

  return { success: true };
}

export function deletePageFolder(pagesDir, pageName) {
  const pageFolder = path.join(pagesDir, pageName);

  if (!fs.existsSync(pageFolder)) {
    return { success: false, error: 'Page not found' };
  }

  fs.rmSync(pageFolder, { recursive: true, force: true });

  return { success: true };
}
