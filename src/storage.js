const DB_NAME = 'peloton-chronicle-db';
const DB_VERSION = 1;
const STORE = 'universes';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: 'slot' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function transaction(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result;
    try {
      result = operation(store);
    } catch (error) {
      reject(error);
      return;
    }
    tx.oncomplete = () => resolve(result?.result ?? result);
    tx.onerror = () => reject(tx.error);
  }).finally(() => database.close());
}

export async function listUniverses() {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => {
      const rows = request.result
        .sort((a, b) => a.slot - b.slot)
        .map(({ slot, name, year, currentDay, eventIndex, updatedAt, createdAt, state }) => ({ slot, name, year, currentDay: currentDay ?? state?.currentDay ?? 1, eventIndex, updatedAt, createdAt }));
      resolve(rows);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => database.close();
  });
}

export async function loadUniverse(slot) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(slot);
    request.onsuccess = () => resolve(request.result?.state ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => database.close();
  });
}

export async function saveUniverse(slot, state) {
  const now = new Date().toISOString();
  const record = {
    slot,
    name: state.name,
    year: state.year,
    currentDay: state.currentDay,
    eventIndex: state.eventIndex,
    createdAt: state.createdAt || now,
    updatedAt: now,
    state: { ...state, createdAt: state.createdAt || now, updatedAt: now }
  };
  await transaction('readwrite', (store) => store.put(record));
  return record.state;
}

export async function deleteUniverse(slot) {
  await transaction('readwrite', (store) => store.delete(slot));
}
