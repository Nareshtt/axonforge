import { COMMIT_WIDTH, COMMIT_HEIGHT, HORIZONTAL_SPACING, VERTICAL_SPACING } from './TimelinePanel';

export function ConnectionLines({ connections, canvasWidth, canvasHeight }) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        overflow: 'visible',
      }}
    >
      {connections.map((conn) => {
        const midX = (conn.from.x + conn.to.x) / 2;

        return (
          <g key={conn.id}>
            <path
              d={`M ${conn.from.x} ${conn.from.y} C ${midX} ${conn.from.y}, ${midX} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`}
              stroke={conn.isBranch ? '#6366f1' : '#333'}
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
              strokeLinecap="round"
            />
            <circle
              cx={conn.from.x}
              cy={conn.from.y}
              r="3"
              fill={conn.isBranch ? '#6366f1' : '#333'}
              opacity="0.6"
            />
            <circle
              cx={conn.to.x}
              cy={conn.to.y}
              r="3"
              fill={conn.isBranch ? '#6366f1' : '#333'}
              opacity="0.6"
            />
          </g>
        );
      })}
    </svg>
  );
}
