import { gitOperations, gitHelpers } from './operations';

function buildCommitTree(commits, headCommit) {
  const commitMap = new Map(
    commits.map((c) => [c.hash, { ...c, children: [] }])
  );

  commits.forEach((commit) => {
    commit.parents.forEach((parentHash) => {
      const parent = commitMap.get(parentHash);
      if (parent) {
        parent.children.push(commit.hash);
      }
    });
  });

  const root = commits.find((c) => c.parents.length === 0);
  if (!root) return [];

  const positioned = [];
  const traverse = (hash, branch = 0, depth = 0) => {
    const commit = commitMap.get(hash);
    if (!commit || positioned.find((p) => p.hash === hash)) return;

    positioned.push({
      ...commit,
      branch,
      depth,
    });

    if (commit.children.length === 0) return;

    traverse(commit.children[0], branch, depth + 1);

    commit.children.slice(1).forEach((childHash, i) => {
      traverse(childHash, branch + i + 1, depth + 1);
    });
  };

  traverse(root.hash);

  return positioned;
}

export const gitLog = {
  getPlain(limit = 50) {
    gitHelpers.ensureRepository();

    if (!gitHelpers.hasCommits()) {
      return '';
    }

    return gitHelpers.run(`git log --oneline -${limit}`).trim();
  },

  getStructured(limit = 200) {
    gitHelpers.ensureRepository();

    if (!gitHelpers.hasCommits()) {
      return [];
    }

    try {
      const head = gitHelpers.run('git rev-parse HEAD').trim();

      const raw = gitHelpers.run(
        `git log --all --pretty=format:"%H|%P|%s|%ct" --date-order -${limit}`
      )
        .trim()
        .split('\n')
        .filter(Boolean);

      const commits = raw.map((line) => {
        const [hash, parents, message, timestamp] = line.split('|');
        return {
          hash,
          shortHash: hash.slice(0, 7),
          message,
          timestamp: parseInt(timestamp) * 1000,
          parents: parents ? parents.split(' ') : [],
          isHead: hash === head,
        };
      });

      return buildCommitTree(commits, head);
    } catch (err) {
      return [];
    }
  },
};
