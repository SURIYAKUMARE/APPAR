import React from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

// Deterministic matrix generator for visual QR mock
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 180, label }) => {
  // Generate pseudo-random matrix derived from hash of the value
  const gridSize = 25;
  const hash = Array.from(value).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42);
  
  const cells: boolean[][] = [];
  for (let r = 0; r < gridSize; r++) {
    cells[r] = [];
    for (let c = 0; c < gridSize; c++) {
      // Corner alignment markers (top-left, top-right, bottom-left)
      const isTL = r < 7 && c < 7;
      const isTR = r < 7 && c >= gridSize - 7;
      const isBL = r >= gridSize - 7 && c < 7;

      if (isTL || isTR || isBL) {
        // Outline 7x7 box with 3x3 solid center
        const border = (r === 0 || r === 6 || c === 0 || c === 6) && isTL;
        const borderTR = (r === 0 || r === 6 || c === gridSize - 7 || c === gridSize - 1) && isTR;
        const borderBL = (r === gridSize - 7 || r === gridSize - 1 || c === 0 || c === 6) && isBL;
        const center = (r >= 2 && r <= 4 && c >= 2 && c <= 4) && isTL;
        const centerTR = (r >= 2 && r <= 4 && c >= gridSize - 5 && c >= gridSize - 5) && isTR;
        const centerBL = (r >= gridSize - 5 && r <= gridSize - 3 && c >= 2 && c <= 4) && isBL;
        cells[r][c] = border || borderTR || borderBL || center || centerTR || centerBL;
      } else {
        // Data bits seeded by hash
        const cellHash = (hash * (r * gridSize + c + 1) + 1337) % 100;
        cells[r][c] = cellHash > 48;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded">
        {cells.map((row, r) =>
          row.map((active, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill={active ? '#0f172a' : '#ffffff'}
            />
          ))
        )}
        {/* Central emblem shield icon */}
        <rect
          x={size * 0.38}
          y={size * 0.38}
          width={size * 0.24}
          height={size * 0.24}
          rx={size * 0.04}
          fill="#1e3a8a"
          stroke="#06b6d4"
          strokeWidth="2"
        />
        <text
          x={size * 0.5}
          y={size * 0.53}
          fill="#ffffff"
          fontSize={size * 0.07}
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          AICTE
        </text>
      </svg>
      {label && <p className="text-[11px] font-mono mt-2 text-slate-600 dark:text-slate-400 text-center">{label}</p>}
    </div>
  );
};
