import { useEffect, useState } from 'react';
import { TimelineNode } from './TimelineNode';

export function TimelineNodeWrapper({ commit, onCheckout }) {
  const [currentHash, setCurrentHash] = useState(null);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const res = await fetch('/__timeline');
        const data = await res.json();
        const head = data.commits?.find((c) => c.isHead);
        if (head) setCurrentHash(head.hash);
      } catch (err) {
        console.error('[timeline] fetch current hash failed:', err);
      }
    };
    fetchCurrent();
  }, []);

  return (
    <TimelineNode
      commit={commit}
      isCurrent={commit.hash === currentHash}
      isHead={commit.isHead}
      onCheckout={onCheckout}
      hasBranches={commit.children?.length > 1}
    />
  );
}
