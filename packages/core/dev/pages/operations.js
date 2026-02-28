import path from 'path';
import fs from 'fs';
import { gitOperations } from '../git';
import { writeSnapshot, readPages, createPageFolder, deletePageFolder } from '../utils';
import {
  updateClassNameInJsx,
  stripAxonIdsInJsx,
  getRootClassName,
  getClassNameFromElementPath,
  updateClassNameAtElementPath,
  updateAttributesAtElementPath,
} from '../utils/jsxAst';

function getPageFilePath(pagesDir, pageId) {
  if (pageId === 'Home') {
    return path.join(pagesDir, 'page.jsx');
  }
  return path.join(pagesDir, pageId, 'page.jsx');
}

export function setupPageOperations(server, pagesDir) {
  // Read page.jsx content
  server.middlewares.use('/__pages/read', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { pageId, elementPath } = JSON.parse(body);
        const filePath = getPageFilePath(pagesDir, pageId);

        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Page not found' }));
          return;
        }

        let content = fs.readFileSync(filePath, 'utf-8');

        // Keep page code clean: strip any previously added editor attributes.
        const stripped = stripAxonIdsInJsx(content);
        if (stripped.changed) {
          content = stripped.code;
          fs.writeFileSync(filePath, content, 'utf-8');
        }

        // AST-based extraction (root + optional selected element)
        const pageClassName = getRootClassName(content);
        const elementClassName = Array.isArray(elementPath)
          ? getClassNameFromElementPath(content, elementPath)
          : null;
        const className = Array.isArray(elementPath) ? (elementClassName || '') : (pageClassName || '');
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ content, className, pageClassName, elementClassName }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  // Update page.jsx content (supports both full content and className-only)
  server.middlewares.use('/__pages/update', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { pageId, content, className, elementPath, attributes } = JSON.parse(body);
        console.log("[pages:update] Received:", { pageId, elementPath, className: className?.slice(0, 50) });
        
        const filePath = getPageFilePath(pagesDir, pageId);

        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Page not found' }));
          return;
        }

        let updatedContent;
        
        if (className !== undefined || attributes !== undefined) {
          // AST-based element update
          const originalCode = fs.readFileSync(filePath, 'utf-8');
          let nextCode = originalCode;

          if (attributes && Array.isArray(elementPath)) {
            nextCode = updateAttributesAtElementPath(nextCode, elementPath, attributes);
          }

          if (className !== undefined) {
            if (Array.isArray(elementPath)) {
              nextCode = updateClassNameAtElementPath(nextCode, elementPath, className);
            } else {
              nextCode = updateClassNameInJsx(nextCode, className);
            }
          }

          updatedContent = nextCode;
          console.log("[pages:update] Updated content length:", updatedContent.length);
        } else if (content !== undefined) {
          // Full content update (legacy)
          updatedContent = content;
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing content or className' }));
          return;
        }

        fs.writeFileSync(filePath, updatedContent, 'utf-8');
        
        gitOperations.commit(`Update page "${pageId}" properties`);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, content: updatedContent }));
      } catch (err) {
        console.error("[pages:update] Error:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

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
