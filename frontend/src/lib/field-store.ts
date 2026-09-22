export type Inspection = { id: number; projectId: number; inspectorId: number; status: string; version: number;
  findings: string; physicalProgressObservedPct: number | null; evidenceIds: number[]; checklist: Record<string, boolean>; reviewNote: string | null };
export type LocalPhoto = { key: string; file: File; caption: string; lat?: number; lng?: number; evidenceId?: number };
export type Draft = { key: string; inspection: Inspection; photos: LocalPhoto[]; savedAt: string; dirty: boolean };

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("mplads-field-v1", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("drafts", { keyPath: "key" });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(new Error("Local storage unavailable. Keep this screen open and sync online."));
  });
}
export async function localDrafts(prefix: string): Promise<Draft[]> {
  const db = await database();
  try { return await new Promise((resolve, reject) => {
    const r = db.transaction("drafts").objectStore("drafts").getAll();
    r.onsuccess = () => resolve((r.result as Draft[]).filter(d => d.key.startsWith(prefix)));
    r.onerror = () => reject(r.error);
  }); } finally { db.close(); }
}
export async function saveLocal(draft: Draft): Promise<void> {
  const db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("drafts", "readwrite");
    tx.objectStore("drafts").put(draft);
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  }); } finally { db.close(); }
}
export async function clearLocal(prefix: string): Promise<void> {
  const rows = await localDrafts(prefix), db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("drafts", "readwrite");
    rows.forEach(d => tx.objectStore("drafts").delete(d.key));
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  }); } finally { db.close(); }
}
