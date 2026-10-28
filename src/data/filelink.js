// Optional link to a real file on the computer (Edge/Chrome only). Save then keeps that file up to date.
// The file handle is remembered in the browser's IndexedDB; the browser asks permission again after a restart.
const DB = 'prepCreator.files', ST = 'handles', KEY = 'history';
const TYPES = [{ description: 'PMU history', accept: { 'application/json': ['.json'] } }];

const idb = () => new Promise((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(ST);
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const tx = async (mode, fn) => { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction(ST, mode); const req = fn(t.objectStore(ST)); t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); }); };

export const supported = () => typeof window.showSaveFilePicker === 'function' && typeof window.showOpenFilePicker === 'function';
let cache = null;   // the handle for this session; IndexedDB keeps it for next time
export const getLinked = async () => { if (cache) return cache; try { cache = (await tx('readonly', s => s.get(KEY))) || null; } catch (e) { cache = null; } return cache; };
const remember = async (hd) => { cache = hd; await tx('readwrite', s => s.put(hd, KEY)); };
export const unlink = async () => { cache = null; await tx('readwrite', s => s.delete(KEY)); };

export async function linkNew() {
  const hd = await window.showSaveFilePicker({ suggestedName: 'PMU history.json', types: TYPES });
  await remember(hd); return hd;
}
export async function linkExisting() {
  const [hd] = await window.showOpenFilePicker({ types: TYPES, multiple: false });
  await remember(hd);
  return { hd, text: await (await hd.getFile()).text() };
}
export async function readLinked(hd) {
  if (!(await ensure(hd, 'read'))) throw new Error('Permission to read the file was not given.');
  return (await hd.getFile()).text();
}
async function ensure(hd, mode) {
  const o = { mode };
  if ((await hd.queryPermission(o)) === 'granted') return true;
  return (await hd.requestPermission(o)) === 'granted';
}
export async function writeLinked(hd, text) {
  if (!(await ensure(hd, 'readwrite'))) throw new Error('Permission to write the file was not given.');
  const w = await hd.createWritable(); await w.write(text); await w.close();
}
