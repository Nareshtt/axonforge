import path from 'path';
import { gitOperations } from './git';
import { setupPageOperations } from './pages';
import { setupTimelineOperations } from './timeline';
import { setupFileWatcher } from './fileWatcher';

export function pageBridge() {
  return {
    name: 'page-bridge',
    configureServer(server) {
      const rootDir = process.cwd();
      const pagesDir = path.resolve(rootDir, 'src/pages');

      gitOperations.initialize();
      setupPageOperations(server, pagesDir);
      setupTimelineOperations(server, pagesDir);
      setupFileWatcher(server, pagesDir);
    },
  };
}
