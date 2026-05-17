import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface HistoryItem {
  id?: number;
  userId: string;
  originalText: string;
  transliteratedText: string;
  targetLanguage: string;
  type: 'text' | 'pdf' | 'image';
  timestamp: number;
}

interface TransliterationDB extends DBSchema {
  history: {
    key: number;
    value: HistoryItem;
    indexes: { 'by-user': string; 'by-timestamp': number };
  };
}

const DB_NAME = 'transliteration-app-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TransliterationDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TransliterationDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('history', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-user', 'userId');
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }
  return dbPromise;
}

export async function saveHistory(item: Omit<HistoryItem, 'id'>) {
  const db = await getDB();
  return db.add('history', item as HistoryItem);
}

export async function getHistory(userId: string) {
  const db = await getDB();
  const index = db.transaction('history').store.index('by-user');
  const items = await index.getAll(userId);
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteHistoryItem(id: number) {
  const db = await getDB();
  return db.delete('history', id);
}

export async function clearUserHistory(userId: string) {
  const db = await getDB();
  const tx = db.transaction('history', 'readwrite');
  const index = tx.store.index('by-user');
  let cursor = await index.openCursor(userId);
  
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}
