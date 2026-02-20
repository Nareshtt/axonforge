import { GitBranch } from 'lucide-react';
import { ConnectionLines } from './ConnectionLines';
import { TimelineNodeWrapper } from './TimelineNodeWrapper';
import { ViewportHint } from './ViewportHint';

export function TimelineViewport({
  commits,
  connections,
  x,
  y,
  scale,
  canvasWidth,
  canvasHeight,
  onCheckout,
}) {
  return (
    <div className="relative flex-1 overflow-hidden bg-black">
      {commits.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className="absolute"
          style={{
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
        >
          <ConnectionLines connections={connections} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />

          {commits.map((commit) => (
            <TimelineNodeWrapper
              key={commit.hash}
              commit={commit}
              onCheckout={() => onCheckout(commit.hash)}
            />
          ))}
        </div>
      )}

      <ViewportHint />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center text-[#333]">
        <GitBranch size={28} className="mx-auto mb-2 opacity-50" />
        <p className="text-xs">No commits yet</p>
        <p className="text-[10px] mt-1 text-[#444]">Make changes to create history</p>
      </div>
    </div>
  );
}
