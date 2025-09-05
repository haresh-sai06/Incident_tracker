
import React, { useState, useEffect, useCallback } from 'react';
import { Incident, User } from '../../types';
import Header from '../layout/Header';
import ModerationCard from './ModerationCard';
import { Loader2 } from 'lucide-react';

const ModerationPage: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [incidentsRes, userRes] = await Promise.all([
                fetch('/api/incidents/all'),
                fetch('/api/auth/current')
            ]);
            if (!incidentsRes.ok || !userRes.ok) throw new Error('Failed to fetch data');
            
            const incidentsData: Incident[] = await incidentsRes.json();
            const userData: User = await userRes.json();
            
            setIncidents(incidentsData);
            setCurrentUser(userData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleIncidentUpdate = useCallback((updatedIncident: Incident) => {
         setIncidents(prev => {
            const index = prev.findIndex(i => i.id === updatedIncident.id);
            if (index !== -1) {
                const newIncidents = [...prev];
                newIncidents[index] = updatedIncident;
                return newIncidents;
            }
            return prev;
        });
    }, []);
    
    const handleNewIncident = useCallback((newIncident: Incident) => {
        setIncidents(prev => [newIncident, ...prev]);
    }, []);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000');
        ws.onopen = () => console.log('Moderation WebSocket connected');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new-incident') {
                handleNewIncident(data.payload);
            } else if (data.type === 'update-incident') {
                handleIncidentUpdate(data.payload);
            }
        };
        ws.onclose = () => setError("WebSocket connection closed.");
        ws.onerror = () => setError("WebSocket connection failed.");
        return () => ws.close();
    }, [handleNewIncident, handleIncidentUpdate]);
    
    const unverifiedIncidents = incidents.filter(i => !i.isVerified && i.status !== 'Closed');

    return (
        <div className="flex flex-col h-full bg-neutral-950">
            <Header
                title="Moderation Queue"
                liveFeedEvents={[]}
                onFocusIncident={() => {}}
                latency={0}
                onLatencyChange={() => {}}
                currentUser={currentUser}
                onUserChange={setCurrentUser}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" size={32} /></div>
                ) : error ? (
                    <div className="text-red-500 text-center">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {unverifiedIncidents.length > 0 ? (
                            unverifiedIncidents.map(incident => (
                                <ModerationCard key={incident.id} incident={incident} currentUser={currentUser} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-neutral-500">
                                <h3 className="text-xl font-semibold">The moderation queue is empty.</h3>
                                <p>All incoming reports have been reviewed.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ModerationPage;
