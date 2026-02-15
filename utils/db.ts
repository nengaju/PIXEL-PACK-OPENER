const DB_NAME = 'PixelPackDB';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('config')) {
                db.createObjectStore('config');
            }
            if (!db.objectStoreNames.contains('progress')) {
                db.createObjectStore('progress');
            }
        };
    });
};

export const saveToDB = async (storeName: string, key: string, value: any) => {
    try {
        const db = await initDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.put(value, key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error("IndexedDB Save Error:", e);
    }
};

export const loadFromDB = async (storeName: string, key: string) => {
    try {
        const db = await initDB();
        return new Promise<any>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error("IndexedDB Load Error:", e);
        return null;
    }
};

export const clearDB = async () => {
     const db = await initDB();
     return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(['config', 'progress'], 'readwrite');
        const p1 = new Promise<void>((res, rej) => {
            const s = tx.objectStore('config').clear();
            s.onsuccess = () => res();
            s.onerror = () => rej();
        });
        const p2 = new Promise<void>((res, rej) => {
             const s = tx.objectStore('progress').clear();
             s.onsuccess = () => res();
             s.onerror = () => rej();
        });

        Promise.all([p1, p2]).then(() => resolve()).catch(reject);
     });
}