import React from 'react';
import { ClassifiedSocialPost } from '../../types';
import { ShieldAlert, Music, ArrowUpCircle, MessageSquare, Twitter, Facebook } from 'lucide-react';

interface SocialFeedProps {
  posts: ClassifiedSocialPost[];
  onPromote: (post: ClassifiedSocialPost) => void;
}

const SocialIcon: React.FC<{ source: ClassifiedSocialPost['source'] }> = ({ source }) => {
    switch(source) {
        case 'Twitter': return <Twitter size={16} className="text-sky-400" />;
        case 'Facebook': return <Facebook size={16} className="text-blue-500" />;
        default: return <MessageSquare size={16} className="text-neutral-500" />;
    }
};

const PostItem: React.FC<{ post: ClassifiedSocialPost, onPromote: (post: ClassifiedSocialPost) => void }> = ({ post, onPromote }) => {
    const isHazard = post.classification === 'hazard';

    return (
        <li className={`p-4 border-l-4 ${isHazard ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-700'}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 text-sm text-neutral-400 mb-2">
                        <SocialIcon source={post.source} />
                        <span className="font-medium text-neutral-300">{post.author}</span>
                        <span>&middot;</span>
                        <time dateTime={post.timestamp}>{new Date(post.timestamp).toLocaleTimeString()}</time>
                    </div>
                    <p className="text-sm text-neutral-200">{post.content}</p>
                </div>
                 <button onClick={() => onPromote(post)} title="Promote to Incident" className="ml-4 flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors py-1 px-2 rounded-md hover:bg-primary-500/10">
                    <ArrowUpCircle size={18} />
                    <span className="hidden xl:inline">Promote</span>
                </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className={`flex items-center space-x-1.5 px-2 py-1 text-xs font-medium rounded-full ${isHazard ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                        {isHazard ? <ShieldAlert size={14} /> : <Music size={14} />}
                        <span>{isHazard ? 'Hazard' : 'Noise'}</span>
                    </span>
                    {post.keywords.length > 0 && (
                        <div className="flex items-center space-x-2">
                            {post.keywords.map(kw => (
                                <span key={kw} className="text-xs text-neutral-400 bg-neutral-700 px-2 py-0.5 rounded-full">{kw}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};


const SocialFeed: React.FC<SocialFeedProps> = ({ posts, onPromote }) => {
  return (
    <div className="h-full">
        {posts.length > 0 ? (
            <ul className="divide-y divide-neutral-700/50">
                {posts.map(post => <PostItem key={post.id} post={post} onPromote={onPromote} />)}
            </ul>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500 text-sm">Waiting for social media posts...</p>
            </div>
        )}
    </div>
  );
};

export default SocialFeed;
