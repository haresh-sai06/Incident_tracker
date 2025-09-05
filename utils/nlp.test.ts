
import { describe, it, expect } from 'vitest';
import { classifyPost } from './nlp';
import { SocialPost } from '../types';

describe('classifyPost', () => {
    it("should classify a post with strong hazard keywords as 'hazard'", () => {
        const post: SocialPost = {
            id: '1',
            timestamp: new Date().toISOString(),
            author: '@test',
            content: 'There is a huge fire and a car crash on the main street. Emergency services are here.',
            source: 'Twitter',
        };
        const result = classifyPost(post);
        expect(result.classification).toBe('hazard');
    });

    it("should classify a post with noise keywords as 'noise'", () => {
        const post: SocialPost = {
            id: '2',
            timestamp: new Date().toISOString(),
            author: '@test',
            content: 'The music festival was amazing! Such fun and great food.',
            source: 'Facebook',
        };
        const result = classifyPost(post);
        expect(result.classification).toBe('noise');
    });
    
    it("should classify a post with weak hazard keywords as 'noise'", () => {
        const post: SocialPost = {
            id: '3',
            timestamp: new Date().toISOString(),
            author: '@test',
            content: 'I saw some smoke earlier, but it was probably just a BBQ.',
            source: 'Twitter',
        };
        const result = classifyPost(post);
        expect(result.classification).toBe('noise');
    });

    it('should correctly extract and rank the top keywords', () => {
        const post: SocialPost = {
            id: '4',
            timestamp: new Date().toISOString(),
            author: '@test',
            content: 'A major accident involving an explosion and fire. Police and ambulance are on the scene.',
            source: 'Twitter',
        };
        const result = classifyPost(post);
        expect(result.classification).toBe('hazard');
        expect(result.keywords).toEqual(['explosion', 'fire', 'accident']);
    });
});
