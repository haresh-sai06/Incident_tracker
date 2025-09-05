import { v4 as uuidv4 } from 'uuid';
import { addToOutbox, QueuedRequest } from './offline';

export async function post(url: string, body: object): Promise<{ queued?: boolean; error?: string; }> {
    const actionId = uuidv4();

    const request: Omit<QueuedRequest, 'timestamp' | 'retryCount'> = {
        id: actionId,
        url,
        payload: { ...body, actionId },
        method: 'POST',
    };

    if (!navigator.onLine) {
        console.log(`App is offline. Queuing action ${actionId}.`);
        await addToOutbox(request);
        return { queued: true };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.payload),
        });

        if (!response.ok) {
            // A server error (5xx) might warrant a retry
            if (response.status >= 500) {
                throw new Error(`Server error: ${response.status}`);
            }
            // Don't queue 4xx errors, they are client-side problems
            const errorText = await response.text();
            console.error(`API Error ${response.status}:`, errorText);
            return { error: `API Error ${response.status}: ${errorText}` };
        }

        return await response.json();
    } catch (error) {
        // This catches network errors (e.g., 'Failed to fetch') and thrown 5xx errors
        console.warn(`API call for ${actionId} failed, queuing for retry.`, error);
        await addToOutbox(request);
        return { queued: true };
    }
}
