import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const HISTORY_DIR = path.join(ROOT, '.axonforge_history');

function run(command) {
  return execSync(command, {
    cwd: HISTORY_DIR,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
}

function ensureRepository() {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR);
  }

  const gitDir = path.join(HISTORY_DIR, '.git');
  if (!fs.existsSync(gitDir)) {
    run('git init');
    run('git config user.name AxonForge');
    run('git config user.email editor@axonforge.local');
  }
}

function hasCommits() {
  try {
    run('git rev-parse HEAD');
    return true;
  } catch {
    return false;
  }
}

export const gitOperations = {
  initialize() {
    ensureRepository();
  },

  commit(message) {
    try {
      ensureRepository();
      run('git add .');
      run(`git commit -m "${message}"`);
    } catch {
      // No-op if nothing changed
    }
  },

  getStatus() {
    ensureRepository();

    if (!hasCommits()) {
      return null;
    }

    try {
      return run('git rev-parse HEAD').trim();
    } catch {
      return null;
    }
  },

  getCurrentBranch() {
    ensureRepository();

    if (!hasCommits()) {
      return 'main';
    }

    try {
      return run('git rev-parse --abbrev-ref HEAD').trim();
    } catch {
      return 'main';
    }
  },

  checkout(commitHash) {
    ensureRepository();

    if (!hasCommits()) {
      return;
    }

    run(`git checkout ${commitHash}`);
  },

  reset(commitHash) {
    ensureRepository();

    if (!hasCommits()) {
      return;
    }

    run(`git reset --hard ${commitHash}`);
  },

  revert(commitHash) {
    ensureRepository();

    if (!hasCommits()) {
      return;
    }

    run(`git revert ${commitHash} --no-edit`);
  },

  createBranch(commitHash, branchName) {
    ensureRepository();

    if (!hasCommits()) {
      return;
    }

    run(`git checkout ${commitHash}`);
    run(`git checkout -b ${branchName}`);
  },

  clearHistory() {
    ensureRepository();

    const gitDir = path.join(HISTORY_DIR, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }

    this.initialize();
  },
};

export const gitHelpers = {
  run,
  ensureRepository,
  hasCommits,
};
