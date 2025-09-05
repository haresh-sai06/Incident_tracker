import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import Header from '../layout/Header';
import { Loader2, ShieldCheck, User as UserIcon, Clock, AlertTriangle } from 'lucide-react';

const PrivacyPage: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [deletionRequests, setDeletionRequests] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const userRes = await fetch('/api/auth/current');
            if (!userRes.ok) throw new Error('Failed to fetch current user');
            const userData: User = await userRes.json();
            setCurrentUser(userData);

            if (userData.role === 'Operator') {
                const requestsRes = await fetch('/api/admin/deletion-requests');
                if (!requestsRes.ok) throw new Error('Failed to fetch deletion requests');
                const requestsData: User[] = await requestsRes.json();
                setDeletionRequests(requestsData);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRequestDeletion = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/users/request-deletion', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to submit request');
            const updatedUser = await response.json();
            setCurrentUser(updatedUser);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" size={32} /></div>;
    }
    
    return (
        <div className="flex flex-col h-full bg-neutral-950">
            <Header
                title="Privacy Center"
                liveFeedEvents={[]}
                onFocusIncident={() => {}}
                latency={0}
                onLatencyChange={() => {}}
                currentUser={currentUser}
                onUserChange={setCurrentUser}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {error && <div className="p-4 rounded-md bg-red-500/10 text-red-400">{error}</div>}
                
                {/* User's Personal Data Request Section */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-2">My Data & Privacy</h2>
                    <p className="text-neutral-400 mb-6">Manage your personal data associated with your account.</p>
                    
                    {currentUser?.deletionRequest?.status === 'pending' ? (
                        <div className="p-4 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            <h3 className="font-semibold flex items-center"><AlertTriangle size={18} className="mr-2" />Deletion Request Pending</h3>
                            <p className="text-sm mt-1">Your request to delete personal data, submitted on {new Date(currentUser.deletionRequest.requestedAt).toLocaleDateString()}, is currently being processed by an administrator.</p>
                        </div>
                    ) : (
                         <div className="flex items-center justify-between p-4 rounded-md bg-neutral-700/50">
                            <div>
                                <h3 className="font-semibold text-white">Request Data Deletion</h3>
                                <p className="text-sm text-neutral-400">Permanently anonymize personal data from incidents you have reported.</p>
                            </div>
                            <button
                                onClick={handleRequestDeletion}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center justify-center w-40"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Request'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Admin View for Deletion Requests */}
                {currentUser?.role === 'Operator' && (
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg">
                         <div className="p-6 border-b border-neutral-700">
                            <h2 className="text-xl font-bold text-white">Admin: Pending Deletion Requests</h2>
                            <p className="text-neutral-400">Review and process data deletion requests from users.</p>
                        </div>
                        {deletionRequests.length > 0 ? (
                            <ul className="divide-y divide-neutral-700">
                                {deletionRequests.map(user => (
                                    <li key={user.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <UserIcon size={32} className="p-1.5 bg-neutral-700 rounded-full text-neutral-300 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-white">{user.name} <span className="text-xs font-normal text-neutral-500">({user.id})</span></p>
                                                <p className="text-sm text-neutral-400">{user.role} {user.agency && ` - ${user.agency}`}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-yellow-400 text-sm">Request Pending</p>
                                            {user.deletionRequest && (
                                                 <p className="text-xs text-neutral-500 flex items-center space-x-1.5">
                                                    <Clock size={12} />
                                                    <span>{new Date(user.deletionRequest.requestedAt).toLocaleString()}</span>
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-10 text-center text-neutral-500">There are no pending data deletion requests.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PrivacyPage;