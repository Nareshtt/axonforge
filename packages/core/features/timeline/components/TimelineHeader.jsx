import {
  GitBranch,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  X,
} from 'lucide-react';
import { IconButton } from './IconButton';
import { TextButton } from './TextButton';
import { Divider } from './Divider';
import { CommitCount } from './CommitCount';
import { DetachedBadge } from './DetachedBadge';

const ACCENT_COLOR = '#6366f1';

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
    <div className="h-10 flex items-center justify-between px-4 border-b border-[#1f1f1f] bg-black">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-white">
          <GitBranch size={14} className="text-[#6366f1]" />
          <span className="text-sm font-medium">History</span>
        </div>

        <CommitCount count={commits.length} />

        {isDetached && <DetachedBadge />}
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={<Undo2 size={14} />}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        />

        <IconButton
          icon={<Redo2 size={14} />}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        />

        <Divider />

        <IconButton
          icon={<ZoomIn size={14} />}
          onClick={onZoomIn}
          title="Zoom In"
        />

        <IconButton
          icon={<ZoomOut size={14} />}
          onClick={onZoomOut}
          title="Zoom Out"
        />

        <IconButton
          icon={<Maximize2 size={14} />}
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

        <IconButton
          icon={<X size={14} />}
          onClick={onToggleTimeline}
          title="Close Timeline"
        />
      </div>
    </div>
  );
}
