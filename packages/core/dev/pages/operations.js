import path from 'path';
import { gitOperations } from '../git';
import { writeSnapshot, readPages, createPageFolder, deletePageFolder } from '../utils';

export function setupPageOperations(server, pagesDir) {
  // Create page
  server.middlewares.use('/__pages/create', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);
        const pageName = name.trim();

        if (!pageName) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Page name required' }));
          return;
        }

        const result = createPageFolder(pagesDir, pageName);
        if (!result.success) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: result.error }));
          return;
        }

        const pages = readPages(pagesDir);
        writeSnapshot(pages);

        // Handle git operations
        const currentHash = gitOperations.getStatus();
        if (currentHash) {
          const branch = gitOperations.getCurrentBranch();
          if (branch === 'HEAD') {
            gitOperations.createBranch(currentHash, `branch-${Date.now()}`);
          }
        }

        gitOperations.commit(`Add page "${pageName}"`);

        // Notify clients
        server.ws.send({
          type: 'custom',
          event: 'pages:update',
          data: pages,
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  // Delete page
  server.middlewares.use('/__pages/delete', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);

        const result = deletePageFolder(pagesDir, name);
        if (!result.success) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: result.error }));
          return;
        }

        const pages = readPages(pagesDir);
        writeSnapshot(pages);

        gitOperations.commit(`Delete page "${name}"`);

        server.ws.send({
          type: 'custom',
          event: 'pages:update',
          data: pages,
        });

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  // Rename page
  server.ws.on('pages:rename', (data) => {
    const { from, to } = data;
    const fromPath = path.join(pagesDir, from);
    const toPath = path.join(pagesDir, to);

    if (!fs.existsSync(fromPath)) return;
    if (fs.existsSync(toPath)) return;

    fs.renameSync(fromPath, toPath);

    const pages = readPages(pagesDir);
    writeSnapshot(pages);

    const currentHash = gitOperations.getStatus();
    if (currentHash) {
      const branch = gitOperations.getCurrentBranch();
      if (branch === 'HEAD') {
        gitOperations.createBranch(currentHash, `branch-${Date.now()}`);
      }
    }

    gitOperations.commit(`Rename page "${from}" → "${to}"`);

    server.ws.send({
      type: 'custom',
      event: 'pages:update',
      data: pages,
    });
  });
}

import fs from 'fs';
