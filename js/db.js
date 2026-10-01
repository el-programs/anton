// Speicherung in IndexedDB: Einträge, Fotos (als Blob), Vorlagen und Einstellungen.
// Alles bleibt auf dem Gerät.

const DB_NAME = "anton";
const DB_VERSION = 1;
let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("entries")) db.createObjectStore("entries", { keyPath: "id" });
      if (!db.objectStoreNames.contains("photos")) db.createObjectStore("photos", { keyPath: "id" });
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

const done = (tx) => new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
const result = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

export async function loadAll() {
  const db = await open();
  const tx = db.transaction(["entries", "kv"], "readonly");
  const entries = await result(tx.objectStore("entries").getAll());
  const kv = tx.objectStore("kv");
  const [settings, templates] = await Promise.all([result(kv.get("settings")), result(kv.get("templates"))]);
  return { entries, settings: settings || null, templates: templates || [] };
}

// Schreibt geänderte und löscht entfernte Einträge in einer Transaktion.
export async function writeEntries(put, del) {
  if (!put.length && !del.length) return;
  const db = await open();
  const tx = db.transaction("entries", "readwrite");
  const st = tx.objectStore("entries");
  put.forEach((e) => st.put(e));
  del.forEach((id) => st.delete(id));
  return done(tx);
}

export async function setKV(key, value) {
  const db = await open();
  const tx = db.transaction("kv", "readwrite");
  tx.objectStore("kv").put(value, key);
  return done(tx);
}

export async function putPhoto(id, blob) {
  const db = await open();
  const tx = db.transaction("photos", "readwrite");
  tx.objectStore("photos").put({ id, blob });
  return done(tx);
}

export async function getPhoto(id) {
  const db = await open();
  const rec = await result(db.transaction("photos").objectStore("photos").get(id));
  return rec ? rec.blob : null;
}

export async function deletePhotos(ids) {
  if (!ids.length) return;
  const db = await open();
  const tx = db.transaction("photos", "readwrite");
  ids.forEach((id) => tx.objectStore("photos").delete(id));
  return done(tx);
}

// Bittet iOS, den Speicher nicht automatisch zu löschen.
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  } catch (e) { /* nicht unterstützt */ }
  return false;
}

// Entfernt Fotos, die zu keinem Eintrag mehr gehören (z. B. nach endgültigem Entfernen).
export async function cleanupPhotos(used) {
  const db = await open();
  // Fotos aus internen Schnappschüssen behalten, damit eine Wiederherstellung vollständig ist.
  const snaps = (await getKV("snapshots")) || [];
  snaps.forEach((sn) => sn.entries.forEach((e) => (e.photos || []).forEach((id) => used.add(id))));
  const keys = await result(db.transaction("photos").objectStore("photos").getAllKeys());
  return deletePhotos(keys.filter((k) => !used.has(k)));
}

// Alle Fotos als Liste {id, blob} für die Sicherung.
export async function allPhotos() {
  const db = await open();
  return result(db.transaction("photos").objectStore("photos").getAll());
}

export async function getKV(key) {
  const db = await open();
  return result(db.transaction("kv").objectStore("kv").get(key));
}

// Ersetzt alle Daten in einer Transaktion. Schlägt ein Schritt fehl, bleibt der alte Stand erhalten.
export async function replaceAll({ entries, photos, templates, settings }) {
  const db = await open();
  const tx = db.transaction(["entries", "photos", "kv"], "readwrite");
  const es = tx.objectStore("entries"), ps = tx.objectStore("photos"), kv = tx.objectStore("kv");
  es.clear();
  entries.forEach((e) => es.put(e));
  // Fotos werden ergänzt, nicht gelöscht: Schnappschüsse verweisen noch auf die alten.
  if (photos) photos.forEach((p) => ps.put(p));
  kv.put(templates, "templates");
  kv.put(settings, "settings");
  return done(tx);
}
