import fs from 'fs';
import path from 'path';
import { gitOperations } from '../git';
import { gitLog } from '../git/log';
import { readSnapshot, applySnapshotToProject, clearSnapshot } from '../utils';

export function setupTimelineOperations(server, pagesDir) {
  // List commits
  server.middlewares.use('/__timeline', (req, res, next) => {
    if (req.method !== 'GET') return next();

    const commits = gitLog.getStructured(200);
    const head = gitOperations.getStatus();

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ commits, head }));
  });

  // Checkout commit
  server.middlewares.use('/__timeline/checkout', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { hash } = JSON.parse(body);

        gitOperations.checkout(hash);

        const snapshot = readSnapshot();
        if (snapshot && snapshot.pages) {
          applySnapshotToProject(snapshot.pages);
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, snapshot }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  // Reset to commit
  server.middlewares.use('/__timeline/reset', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { hash } = JSON.parse(body);

        gitOperations.reset(hash);

        const snapshot = readSnapshot();
        if (snapshot && snapshot.pages) {
          applySnapshotToProject(snapshot.pages);
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, snapshot }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  // Revert commit
  server.middlewares.use('/__timeline/revert', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { hash } = JSON.parse(body);

        gitOperations.revert(hash);

        const snapshot = readSnapshot();

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, snapshot }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  // Clear all history
  server.middlewares.use('/__timeline/clear', (req, res, next) => {
    if (req.method !== 'POST') return next();

    try {
      gitOperations.clearHistory();
      clearSnapshot();

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  // Create branch
  server.middlewares.use('/__timeline/create-branch', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { hash, branchName } = JSON.parse(body);

        gitOperations.createBranch(hash, branchName);

        const snapshot = readSnapshot();

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, snapshot }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });

  // Apply snapshot
  server.middlewares.use('/__timeline/apply', (req, res, next) => {
    if (req.method !== 'POST') return next();

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { hash } = JSON.parse(body);

        gitOperations.checkout(hash);

        const snapshot = readSnapshot();
        if (snapshot && snapshot.pages) {
          applySnapshotToProject(snapshot.pages);
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  });
}
