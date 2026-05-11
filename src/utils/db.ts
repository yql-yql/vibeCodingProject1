import Dexie, { type EntityTable } from "dexie";

export interface SavedProject {
  id?: number;
  name: string;
  gridWidth: number;
  gridHeight: number;
  cells: { color: string }[][];
  updatedAt: string;
}

const db = new Dexie("BeadStudio") as Dexie & {
  projects: EntityTable<SavedProject, "id">;
};

db.version(1).stores({
  projects: "++id, name, updatedAt",
});

export { db };
