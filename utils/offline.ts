import { openDB, DBSchema } from 'idb';

export interface QueuedRequest {
    id: string; // Unique ID for the action, used for deduplication
    url: string;
    method: 'POST' | 'PUT' | 'DELETE';
    payload: any;
    timestamp: number;
    retryCount: number;
}

interface OutboxDB extends DBSchema {
    outbox: {
        key: string;
        value: QueuedRequest;
    };
}

const DB_NAME = 'incident-response-outbox';
const DB_VERSION = 1;
const STORE_NAME = 'outbox';

const dbPromise = openDB<OutboxDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
});

export async function addToOutbox(request: Omit<QueuedRequest, 'timestamp' | 'retryCount'>): Promise<void> {
    const db = await dbPromise;
    const queuedRequest: QueuedRequest = {
        ...request,
        timestamp: Date.now(),
        retryCount: 0,
    };
    await db.put(STORE_NAME, queuedRequest);
    console.log(`Request ${request.id} added to outbox.`);
}

async function processRequest(request: QueuedRequest): Promise<boolean> {
    try {
        const response = await fetch(request.url, {
            method: request.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.payload),
        });

        if (!response.ok) {
            // Server error, keep in queue for retry
            if (response.status >= 500) {
                console.warn(`Server error for request ${request.id}. Will retry.`);
                return false;
            }
            // Client error or other issue, discard
            console.error(`Request ${request.id} failed with status ${response.status}. Discarding.`);
            return true; 
        }

        console.log(`Successfully synced request ${request.id}.`);
        return true; // Success, remove from queue
    } catch (error) {
        console.warn(`Network error processing request ${request.id}. Will retry.`, error);
        return false; // Network error, keep in queue
    }
}

export async function processOutbox(): Promise<void> {
    const db = await dbPromise;
    const requests = await db.getAll(STORE_NAME);

    if (requests.length === 0) {
        return;
    }

    console.log(`Processing ${requests.length} requests from outbox...`);

    for (const request of requests) {
        const backoffDelay = Math.min(30000, 1000 * Math.pow(2, request.retryCount)); // Max 30s
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));

        const success = await processRequest(request);
        if (success) {
            await db.delete(STORE_NAME, request.id);
        } else {
            request.retryCount += 1;
            await db.put(STORE_NAME, request);
        }
    }
}

export function initializeSync() {
    // Process outbox on startup
    processOutbox();

    // Add event listeners for online/offline events
    window.addEventListener('online', processOutbox);

    console.log('Offline sync service initialized.');
}
