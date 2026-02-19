import path from 'path';
import { gitOperations } from './git';
import { writeSnapshot, readPages } from './utils';

export function setupFileWatcher(server, pagesDir) {
  const watcher = server.watcher;

  watcher.on('addDir', (filePath) => {
    if (path.dirname(filePath) !== pagesDir) return;

    const pages = readPages(pagesDir);
    writeSnapshot(pages);

    const pageName = path.basename(filePath);
    gitOperations.commit(`Add page "${pageName}"`);

    server.ws.send({
      type: 'custom',
      event: 'pages:update',
      data: pages,
    });
  });

  watcher.on('unlinkDir', (filePath) => {
    if (path.dirname(filePath) !== pagesDir) return;

    const pages = readPages(pagesDir);
    writeSnapshot(pages);

    const pageName = path.basename(filePath);
    gitOperations.commit(`Delete page "${pageName}"`);

    server.ws.send({
      type: 'custom',
      event: 'pages:update',
      data: pages,
    });
  });
}
