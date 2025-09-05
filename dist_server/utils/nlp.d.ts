interface SocialPost {
    id: string;
    timestamp: string;
    author: string;
    content: string;
    source: 'Twitter' | 'Facebook' | 'Instagram';
}
interface ClassifiedSocialPost extends SocialPost {
    classification: 'hazard' | 'noise';
    sentiment: number;
    keywords: string[];
}
export declare const classifyPost: (post: SocialPost) => ClassifiedSocialPost;
export {};
