import { useState, useEffect } from 'react';

const COMMIT_WIDTH = 280;
const COMMIT_HEIGHT = 100;
const HORIZONTAL_SPACING = 120;
const VERTICAL_SPACING = 140;

export function useTimelineData() {
  const [commits, setCommits] = useState([]);
  const [currentHash, setCurrentHash] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDetached, setIsDetached] = useState(false);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (commits.length === 0) return;

    const newConnections = [];

    commits.forEach((commit) => {
      commit.parents.forEach((parentHash) => {
        const parent = commits.find((c) => c.hash === parentHash);
        if (!parent) return;

        const parentCircle = {
          x: parent.depth * (COMMIT_WIDTH + HORIZONTAL_SPACING) + COMMIT_WIDTH,
          y: parent.branch * VERTICAL_SPACING + COMMIT_HEIGHT / 2,
        };

        const childCircle = {
          x: commit.depth * (COMMIT_WIDTH + HORIZONTAL_SPACING),
          y: commit.branch * VERTICAL_SPACING + COMMIT_HEIGHT / 2,
        };

        newConnections.push({
          id: `${parent.hash}-${commit.hash}`,
          from: parentCircle,
          to: childCircle,
          isBranch: commit.branch !== parent.branch,
          parentHash: parent.hash,
          childHash: commit.hash,
        });
      });
    });

    setConnections(newConnections);
  }, [commits]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch('/__timeline');
      const data = await res.json();
      const newCommits = data.commits || [];

      setCommits(newCommits);

      const head = newCommits.find((c) => c.isHead);
      if (head) {
        setCurrentHash(head.hash);
        setIsDetached(false);
      }

      if (history.length === 0) {
        setHistory([newCommits]);
        setHistoryIndex(0);
      }
    } catch (err) {
      console.error('[timeline] fetch failed:', err);
    }
  };

  const saveToHistory = (newCommits) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newCommits]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCommits(prevState);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCommits(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const checkout = async (hash) => {
    try {
      const res = await fetch('/__timeline/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
      });

      if (res.ok) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (err) {
      console.error('[timeline] checkout failed:', err);
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch('/__timeline/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setCommits([]);
        setCurrentHash(null);
        setHistory([[]]);
        setHistoryIndex(0);
        setIsDetached(false);
        setConnections([]);
        window.location.reload();
      }
    } catch (err) {
      console.error('[timeline] clear all failed:', err);
    }
  };

  useEffect(() => {
    window.__timelineUndo = undo;
    window.__timelineRedo = redo;
    return () => {
      delete window.__timelineUndo;
      delete window.__timelineRedo;
    };
  }, [historyIndex, history]);

  const maxDepth = Math.max(...commits.map((c) => c.depth || 0), 0);
  const maxBranch = Math.max(...commits.map((c) => c.branch || 0), 0);
  const canvasWidth = (maxDepth + 1) * (COMMIT_WIDTH + HORIZONTAL_SPACING) + 200;
  const canvasHeight = (maxBranch + 1) * VERTICAL_SPACING + 200;

  const isAtHead = currentHash === commits.find((c) => c.isHead)?.hash;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    commits,
    currentHash,
    connections,
    isDetached,
    canvasWidth,
    canvasHeight,
    canUndo,
    canRedo,
    isAtHead,
    setCommits,
    fetchTimeline,
    saveToHistory,
    undo,
    redo,
    checkout,
    clearAll,
  };
}
