import React from 'react';
import { Incident, User } from '../../types';
import * as api from '../../utils/api';
import { MapPin, Clock, User as UserIcon, Check, X, Hand, Info } from 'lucide-react';

interface ModerationCardProps {
    incident: Incident;
    currentUser: User | null;
}

const ModerationCard: React.FC<ModerationCardProps> = ({ incident, currentUser }) => {

    const handleAction = (action: 'claim' | 'verify' | 'reject' | 'request-info') => {
        // Fire-and-forget call to the API client.
        // It handles offline queuing, and the UI will update via WebSocket.
        api.post(`/api/incidents/${incident.id}/${action}`, {});
    };

    const isClaimedByOther = incident.claimedBy && incident.claimedBy !== currentUser?.id;

    return (
        <div className={`bg-neutral-800 rounded-lg border border-neutral-700 flex flex-col transition-opacity duration-300 ${isClaimedByOther ? 'opacity-50' : ''}`}>
            {incident.media.length > 0 ? (
                <img src={incident.media[0]} alt="Incident" className="rounded-t-lg aspect-video object-cover" />
            ) : (
                <div className="rounded-t-lg aspect-video bg-neutral-700 flex items-center justify-center">
                    <p className="text-neutral-500">No Media</p>
                </div>
            )}
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-white">{incident.type}</h3>
                <p className="text-sm text-neutral-400 mb-3">Severity: {incident.severity}</p>
                
                <div className="space-y-2 text-sm text-neutral-300 flex-grow">
                    <div className="flex items-center space-x-2">
                        <MapPin size={14} className="text-neutral-500" />
                        <span>{incident.lat.toFixed(3)}, {incident.lon.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock size={14} className="text-neutral-500" />
                        <span>{new Date(incident.timestamp).toLocaleString()}</span>
                    </div>
                     <div className="flex items-center space-x-2">
                        <UserIcon size={14} className="text-neutral-500" />
                        <span>{incident.reporter_name} ({incident.source})</span>
                    </div>
                </div>

                {incident.claimedBy && (
                    <div className="mt-4 text-xs text-center p-2 rounded-md bg-yellow-500/10 text-yellow-400">
                        Claimed by: {incident.claimedBy === currentUser?.id ? 'You' : incident.claimedBy}
                    </div>
                )}
            </div>
            <div className="p-2 border-t border-neutral-700 bg-neutral-800/50 rounded-b-lg">
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => handleAction('claim')}
                        disabled={!!incident.claimedBy}
                        className="flex items-center justify-center space-x-1 py-2 px-2 text-sm rounded-md transition-colors bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-700/50 disabled:cursor-not-allowed disabled:text-neutral-500"
                    >
                        <Hand size={16} /><span>Claim</span>
                    </button>
                    <button
                        onClick={() => handleAction('request-info')}
                        disabled={isClaimedByOther || incident.isFlagged}
                        className="flex items-center justify-center space-x-1 py-2 px-2 text-sm rounded-md transition-colors bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Info size={16} /><span>Info</span>
                    </button>
                    <button
                        onClick={() => handleAction('reject')}
                        disabled={isClaimedByOther}
                        className="flex items-center justify-center space-x-1 py-2 px-2 text-sm rounded-md transition-colors bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={16} /><span>Reject</span>
                    </button>
                    <button
                        onClick={() => handleAction('verify')}
                        disabled={isClaimedByOther}
                        className="flex items-center justify-center space-x-1 py-2 px-2 text-sm rounded-md transition-colors bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={16} /><span>Verify</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModerationCard;