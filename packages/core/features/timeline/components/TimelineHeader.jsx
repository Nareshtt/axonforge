import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { IconButton } from './IconButton';
import { TextButton } from './TextButton';
import { Divider } from './Divider';
import { CommitCount } from './CommitCount';
import { DetachedBadge } from './DetachedBadge';

export function TimelineHeader({
  commits,
  isDetached,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onReset,
  onClearAll,
  onToggleTimeline,
}) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-neutral-800/70 bg-[#0a0a0a]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-neutral-300">
          <GitBranch size={16} />
          <span className="text-sm font-semibold">History</span>
        </div>

        <CommitCount count={commits.length} />

        {isDetached && <DetachedBadge />}
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          icon={<Undo2 size={16} />}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        />

        <IconButton
          icon={<Redo2 size={16} />}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        />

        <Divider />

        <IconButton
          icon={<ZoomIn size={16} />}
          onClick={onZoomIn}
          title="Zoom In"
        />

        <IconButton
          icon={<ZoomOut size={16} />}
          onClick={onZoomOut}
          title="Zoom Out"
        />

        <IconButton
          icon={<Maximize2 size={16} />}
          onClick={onReset}
          title="Reset View (R)"
        />

        <Divider />

        <TextButton
          text="Clear All"
          onClick={onClearAll}
          disabled={commits.length === 0}
          variant="danger"
        />

        <Divider />

        <TextButton text="Close" onClick={onToggleTimeline} />
      </div>
    </div>
  );
}
