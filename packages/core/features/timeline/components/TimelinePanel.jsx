import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import { useTimelineViewport } from '../../../stores/useTimelineViewport';
import { useTimelineData } from '../hooks/useTimelineData';
import { TimelineHeader } from './TimelineHeader';
import { TimelineViewport } from './TimelineViewport';

const COMMIT_WIDTH = 280;
const COMMIT_HEIGHT = 100;
const HORIZONTAL_SPACING = 120;
const VERTICAL_SPACING = 140;

const ZOOM_OUT_FACTOR = 0.9;
const ZOOM_IN_FACTOR = 1.1;
const LERP_FACTOR = 0.15;

export function TimelinePanel() {
  const open = useEditorStore((s) => s.timelineOpen);
  const toggleTimeline = useEditorStore((s) => s.toggleTimeline);
  const setFocusedSurface = useEditorStore((s) => s.setFocusedSurface);

  const { x, y, scale, zoomAt, zoomTo } = useTimelineViewport();

  const {
    commits,
    connections,
    isDetached,
    canUndo,
    canRedo,
    canvasWidth,
    canvasHeight,
    fetchTimeline,
    undo,
    redo,
    checkout,
    clearAll,
  } = useTimelineData();

  const panelRef = useRef(null);
  const zoomTarget = useRef({
    scale: scale,
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    if (!open) return;
    fetchTimeline();
  }, [open, fetchTimeline]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!zoomTarget.current.active) {
        zoomTarget.current.scale = useTimelineViewport.getState().scale;
        zoomTarget.current.active = true;
      }

      const rect = panel.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const factor = e.deltaY > 0 ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR;
      zoomTarget.current.scale *= factor;
      zoomTarget.current.x = cx;
      zoomTarget.current.y = cy;
    };

    panel.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      panel.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const onTick = () => {
      const currentScale = useTimelineViewport.getState().scale;

      if (!zoomTarget.current.active) {
        zoomTarget.current.scale = currentScale;
        return;
      }

      const { scale: targetScale, x: mx, y: my } = zoomTarget.current;

      if (Math.abs(targetScale - currentScale) < 0.001) {
        zoomTarget.current.active = false;
        zoomTarget.current.scale = currentScale;
        return;
      }

      zoomTarget.current.active = true;
      const newScale = currentScale + (targetScale - currentScale) * LERP_FACTOR;
      zoomTo(newScale, mx, my);
    };

    const intervalId = setInterval(onTick, 16);

    return () => clearInterval(intervalId);
  }, [zoomTo]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      onMouseEnter={() => setFocusedSurface('timeline')}
      onMouseLeave={() => setFocusedSurface('canvas')}
      className="fixed bottom-0 left-0 right-0 h-72 bg-black border-t border-[#1f1f1f] z-50 flex flex-col select-none"
    >
      <TimelineHeader
        commits={commits}
        isDetached={isDetached}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={() => zoomAt(1.2, panelRef.current?.clientWidth / 2, 0)}
        onZoomOut={() => zoomAt(0.8, panelRef.current?.clientWidth / 2, 0)}
        onReset={() => useTimelineViewport.getState().reset()}
        onClearAll={clearAll}
        onToggleTimeline={toggleTimeline}
      />

      <TimelineViewport
        commits={commits}
        connections={connections}
        x={x}
        y={y}
        scale={scale}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onCheckout={checkout}
      />
    </div>
  );
}

export { COMMIT_WIDTH, COMMIT_HEIGHT, HORIZONTAL_SPACING, VERTICAL_SPACING };
