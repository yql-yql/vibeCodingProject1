import { create } from "zustand";

export type Tool = "pen" | "eraser" | "eyedropper" | "fill";

export interface GridCell {
  color: string; // bead color code or 'transparent'
}

export interface EditorState {
  // grid
  gridWidth: number;
  gridHeight: number;
  cells: GridCell[][];

  // tool
  activeTool: Tool;
  activeColor: string;

  // zoom
  zoom: number;

  // undo/redo
  history: GridCell[][][];
  historyIndex: number;
  maxHistory: number;

  // actions
  initGrid: (width: number, height: number) => void;
  setCell: (x: number, y: number, color: string) => void;
  fillArea: (x: number, y: number, color: string) => void;
  setActiveTool: (tool: Tool) => void;
  setActiveColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  loadGrid: (cells: GridCell[][]) => void;
  resizeGrid: (width: number, height: number) => void;
}

function createEmptyGrid(w: number, h: number): GridCell[][] {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ color: "transparent" })),
  );
}

function cloneGrid(grid: GridCell[][]): GridCell[][] {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

function pushHistory(state: EditorState): Partial<EditorState> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(cloneGrid(state.cells));
  if (newHistory.length > state.maxHistory) {
    newHistory.shift();
  }
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  gridWidth: 29,
  gridHeight: 29,
  cells: createEmptyGrid(29, 29),
  activeTool: "pen",
  activeColor: "S01",
  zoom: 20,
  history: [createEmptyGrid(29, 29)],
  historyIndex: 0,
  maxHistory: 50,

  initGrid: (width, height) => {
    const grid = createEmptyGrid(width, height);
    set({
      gridWidth: width,
      gridHeight: height,
      cells: grid,
      history: [cloneGrid(grid)],
      historyIndex: 0,
    });
  },

  setCell: (x, y, color) => {
    const state = get();
    if (x < 0 || x >= state.gridWidth || y < 0 || y >= state.gridHeight) return;
    if (state.cells[y][x].color === color) return;

    const historyUpdate = pushHistory(state);
    const newCells = cloneGrid(state.cells);
    newCells[y][x] = { color };

    set({ ...historyUpdate, cells: newCells });
  },

  fillArea: (x, y, color) => {
    const state = get();
    if (x < 0 || x >= state.gridWidth || y < 0 || y >= state.gridHeight) return;
    const targetColor = state.cells[y][x].color;
    if (targetColor === color) return;

    const newCells = cloneGrid(state.cells);
    const stack = [[x, y]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      if (cx < 0 || cx >= state.gridWidth || cy < 0 || cy >= state.gridHeight) continue;
      if (newCells[cy][cx].color !== targetColor) continue;

      visited.add(key);
      newCells[cy][cx] = { color };

      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    const historyUpdate = pushHistory(state);
    set({ ...historyUpdate, cells: newCells });
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveColor: (color) => set({ activeColor: color }),
  setZoom: (zoom) => set({ zoom: Math.max(4, Math.min(40, zoom)) }),

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    set({
      historyIndex: newIndex,
      cells: cloneGrid(state.history[newIndex]),
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    set({
      historyIndex: newIndex,
      cells: cloneGrid(state.history[newIndex]),
    });
  },

  loadGrid: (cells) => {
    const h = cells.length;
    const w = cells[0]?.length ?? 0;
    set({
      gridWidth: w,
      gridHeight: h,
      cells: cloneGrid(cells),
      history: [cloneGrid(cells)],
      historyIndex: 0,
    });
  },

  resizeGrid: (width, height) => {
    const state = get();
    const newCells = createEmptyGrid(width, height);
    // copy existing data where possible
    for (let y = 0; y < Math.min(height, state.gridHeight); y++) {
      for (let x = 0; x < Math.min(width, state.gridWidth); x++) {
        newCells[y][x] = { ...state.cells[y][x] };
      }
    }
    set({
      gridWidth: width,
      gridHeight: height,
      cells: newCells,
      history: [cloneGrid(newCells)],
      historyIndex: 0,
    });
  },
}));
