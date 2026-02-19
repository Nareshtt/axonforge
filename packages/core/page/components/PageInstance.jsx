import { Group, Rect, Text } from 'react-konva';
import { useEditorStore } from '../../stores/editorStore';

export function PageInstance({ page }) {
  const mode = useEditorStore((s) => s.mode);
  const selectedPageId = useEditorStore((s) => s.selectedPageId);
  const selectPage = useEditorStore((s) => s.selectPage);

  const isSelected = selectedPageId === page.id;

  const handleClick = (e) => {
    if (mode !== 'view') return;
    if (e.evt.button !== 0) return;

    e.cancelBubble = true;
    selectPage(page.id);
  };

  const x = Number.isFinite(page.cx) ? page.cx : 0;
  const y = Number.isFinite(page.cy) ? page.cy : 0;
  const w = Number.isFinite(page.width) ? page.width : 400;
  const h = Number.isFinite(page.height) ? page.height : 300;

  return (
    <Group x={x - w / 2} y={y - h / 2}>
      <PageBackground width={w} height={h} />

      {isSelected && (
        <SelectionBorder width={w} height={h} />
      )}

      <ClickCatcher
        width={w}
        height={h}
        onClick={handleClick}
      />

      <PageLabel name={page.name} />
    </Group>
  );
}

function PageBackground({ width, height }) {
  return (
    <Rect
      width={width}
      height={height}
      fill="#0a0a0a"
      cornerRadius={4}
      listening={false}
    />
  );
}

function SelectionBorder({ width, height }) {
  return (
    <Rect
      width={width}
      height={height}
      stroke="#facc15"
      strokeWidth={2}
      fillEnabled={false}
      listening={false}
    />
  );
}

function ClickCatcher({ width, height, onClick }) {
  return (
    <Rect
      width={width}
      height={height}
      fill="transparent"
      onMouseDown={onClick}
    />
  );
}

function PageLabel({ name }) {
  return (
    <Text
      text={name}
      x={8}
      y={-64}
      fontSize={60}
      fill="#aaa"
      listening={false}
    />
  );
}
