interface SocialPost {
  id: string;
  timestamp: string;
  author: string;
  content: string;
  source: 'Twitter' | 'Facebook' | 'Instagram';
}

interface ClassifiedSocialPost extends SocialPost {
  classification: 'hazard' | 'noise';
  sentiment: number; // e.g., -1 to 1
  keywords: string[];
}

// --- NLP Classifier ---
const HAZARD_KEYWORDS: Record<string, number> = {
    fire: 5, crash: 5, accident: 5, police: 4, sirens: 4, emergency: 5,
    assault: 6, stolen: 4, gun: 7, help: 3, trapped: 5, injury: 5, theft: 4,
    vandalism: 3, smoke: 3, blocked: 2, explosion: 6, suspicious: 3, ambulance: 4,
};
const NOISE_KEYWORDS: Record<string, number> = {
    concert: -4, parade: -4, festival: -4, food: -3, music: -3, party: -3,
    sale: -4, great: -2, amazing: -2, beautiful: -2, fun: -2,
};
const NEGATIVE_SENTIMENT: Record<string, number> = {
    terrible: -3, awful: -3, scary: -4, bad: -2, avoid: -3, nightmare: -4,
    sad: -2, broken: -2,
};
const POSITIVE_SENTIMENT: Record<string, number> = {
    great: 2, amazing: 2, beautiful: 2, fun: 2, safe: 4, resolved: 3,
};
const HAZARD_THRESHOLD = 4;

export const classifyPost = (post: SocialPost): ClassifiedSocialPost => {
    const content = post.content.toLowerCase().replace(/[.,!?:;]/g, '');
    const tokens = content.split(/\s+/);
    let hazardScore = 0, sentimentScore = 0;
    const foundKeywords: { word: string, score: number }[] = [];

    tokens.forEach(token => {
        if (HAZARD_KEYWORDS[token]) {
            const score = HAZARD_KEYWORDS[token];
            hazardScore += score;
            foundKeywords.push({ word: token, score });
        }
        if (NOISE_KEYWORDS[token]) hazardScore += NOISE_KEYWORDS[token];
        if (NEGATIVE_SENTIMENT[token]) sentimentScore += NEGATIVE_SENTIMENT[token];
        if (POSITIVE_SENTIMENT[token]) sentimentScore += POSITIVE_SENTIMENT[token];
    });

    return {
        ...post,
        classification: hazardScore >= HAZARD_THRESHOLD ? 'hazard' : 'noise',
        sentiment: Math.max(-1, Math.min(1, sentimentScore / 5)), // Rough normalization
        keywords: foundKeywords.sort((a, b) => b.score - a.score).slice(0, 3).map(k => k.word),
    };
};
