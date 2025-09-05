export declare function post(url: string, body: object): Promise<{
    queued?: boolean;
    error?: string;
}>;
