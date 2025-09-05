export interface QueuedRequest {
    id: string;
    url: string;
    method: 'POST' | 'PUT' | 'DELETE';
    payload: any;
    timestamp: number;
    retryCount: number;
}
export declare function addToOutbox(request: Omit<QueuedRequest, 'timestamp' | 'retryCount'>): Promise<void>;
export declare function processOutbox(): Promise<void>;
export declare function initializeSync(): void;
