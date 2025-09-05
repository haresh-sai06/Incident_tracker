export interface Incident {
    id: string;
    lat: number;
    lon: number;
    type: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Reported' | 'In Progress' | 'Resolved' | 'Closed';
    timestamp: string;
    reporter_name: string;
    source: string;
    media: string[];
    isVerified: boolean;
    isFlagged?: boolean;
    notes?: string[];
    breadcrumb?: {
        ts: string;
        lat: number;
        lon: number;
    }[];
    claimedBy?: string;
    auditLog: AuditLogEntry[];
    fnol?: FnolStatus;
    isAnonymized?: boolean;
}
interface FnolStatus {
    status: 'None' | 'Submitted' | 'Accepted' | 'Rejected';
    claimId?: string;
    lastUpdated: string;
}
interface SocialPost {
    id: string;
    timestamp: string;
    author: string;
    content: string;
    source: 'Twitter' | 'Facebook' | 'Instagram';
}
interface AuditLogEntry {
    user: string;
    role: string;
    timestamp: string;
    action: string;
    comment: string;
}
interface ClassifiedSocialPost extends SocialPost {
    classification: 'hazard' | 'noise';
    sentiment: number;
    keywords: string[];
}
export declare const classifyPost: (post: SocialPost) => ClassifiedSocialPost;
export {};
