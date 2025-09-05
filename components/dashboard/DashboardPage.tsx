import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../layout/Header';
import KpiCards from './KpiCards';
import FiltersPanel, { Filters } from './FiltersPanel';
import IncidentTable, { SortConfig, SortableKeys } from './IncidentTable';
import IncidentMap from './IncidentMap';
import IncidentDetailDrawer from './IncidentDetailDrawer';
import { Incident, ClassifiedSocialPost, AlertRule, AlertLog, User } from '../../types';
import ActivityPanel from './ActivityPanel';
import FiltersDrawer from './FiltersDrawer';
import { Filter } from 'lucide-react';

const SEVERITY_MAP: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
const SEVERITY_LABELS: { [key: number]: string } = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const ITEMS_PER_PAGE = 10;

const DashboardPage: React.FC = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<Filters>({ dateStart: '', dateEnd: '', type: '', severity: 1 });
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'timestamp', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

    // Real-time & App state
    const [liveFeedEvents, setLiveFeedEvents] = useState<Incident[]>([]);
    const [newIncidentIds, setNewIncidentIds] = useState<Set<string>>(new Set());
    const [latency, setLatency] = useState<number>(0);
    const [mapView, setMapView] = useState<{ center: [number, number]; zoom: number } | null>(null);
    const [socialPosts, setSocialPosts] = useState<ClassifiedSocialPost[]>([]);
    const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
    const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [incidentsRes, rulesRes, logsRes, userRes] = await Promise.all([
                fetch('/api/incidents/all'), // Fetch ALL incidents, not just verified
                fetch('/api/rules'),
                fetch('/api/alerts/logs'),
                fetch('/api/auth/current')
            ]);
            if (!incidentsRes.ok || !rulesRes.ok || !logsRes.ok || !userRes.ok) {
                throw new Error(`HTTP error! Failed to fetch initial data.`);
            }
            
            const incidentsData: Incident[] = await incidentsRes.json();
            const rulesData: AlertRule[] = await rulesRes.json();
            const logsData: AlertLog[] = await logsRes.json();
            const userData: User = await userRes.json();

            setIncidents(incidentsData);
            setAlertRules(rulesData);
            setAlertLogs(logsData);
            setCurrentUser(userData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleNewIncident = useCallback((newIncident: Incident) => {
        setIncidents(prevIncidents => {
            // Defensively check for duplicates before adding to prevent key errors
            if (prevIncidents.some(incident => incident.id === newIncident.id)) {
                return prevIncidents;
            }
            return [newIncident, ...prevIncidents];
        });
        setLiveFeedEvents(prev => [newIncident, ...prev].slice(0, 10));
    }, []);

    const handleIncidentUpdate = useCallback((updatedIncident: Incident) => {
        setIncidents(prev => {
            const existingIndex = prev.findIndex(i => i.id === updatedIncident.id);
            if (existingIndex !== -1) {
                const newIncidents = [...prev];
                newIncidents[existingIndex] = updatedIncident;
                return newIncidents;
            }
            // If it's not in the list (unlikely, but possible), add it.
            return [updatedIncident, ...prev];
        });
    }, []);


    useEffect(() => {
        const ws = new WebSocket("ws://localhost:4000");
        ws.onopen = () => console.log('WebSocket connected');
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setTimeout(() => {
                     // Ensure socket is still open before processing
                    if (ws.readyState !== WebSocket.OPEN) return;
                    
                    switch (data.type) {
                        case 'update-incident':
                            handleIncidentUpdate(data.payload);
                            break;
                        case 'new-incident':
                            handleNewIncident(data.payload);
                            break;
                        case 'new-social-post':
                            setSocialPosts(prev => [data.payload, ...prev].slice(0, 50));
                            break;
                        case 'new-alert-log':
                            setAlertLogs(prev => [data.payload, ...prev].slice(0, 50));
                            break;
                    }
                }, latency * 1000);
            } catch (e) { console.error('Error processing WebSocket message:', e); }
        };
        ws.onclose = () => setError('WebSocket connection closed.');
        ws.onerror = () => setError('WebSocket connection failed.');
        return () => ws.close();
    }, [latency, handleIncidentUpdate, handleNewIncident]);

    const incidentTypes = useMemo(() => [...new Set(incidents.map(i => i.type))].sort(), [incidents]);

    const filteredIncidents = useMemo(() => {
        let filtered = incidents;
        if (filters.dateStart) filtered = filtered.filter(i => new Date(i.timestamp) >= new Date(filters.dateStart));
        if (filters.dateEnd) {
            const endDate = new Date(filters.dateEnd);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(i => new Date(i.timestamp) <= endDate);
        }
        if (filters.type) filtered = filtered.filter(i => i.type === filters.type);
        if (filters.severity) filtered = filtered.filter(i => SEVERITY_MAP[i.severity] >= filters.severity);
        return filtered;
    }, [incidents, filters]);
    
    const sortedIncidents = useMemo(() => {
        let sortableItems = [...filteredIncidents];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = sortConfig.key === 'severity' ? SEVERITY_MAP[a.severity] : new Date(a.timestamp).getTime();
                let bValue = sortConfig.key === 'severity' ? SEVERITY_MAP[b.severity] : new Date(b.timestamp).getTime();
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredIncidents, sortConfig]);

    const paginatedIncidents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedIncidents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedIncidents, currentPage]);
    
    const selectedIncident = useMemo(() => incidents.find(i => i.id === selectedIncidentId) || null, [selectedIncidentId, incidents]);

    const handleSelectIncident = (incidentId: string | null) => {
        setSelectedIncidentId(incidentId);
        if (incidentId) {
             const incident = incidents.find(i => i.id === incidentId);
             if (incident) setMapView({ center: [incident.lat, incident.lon], zoom: 16 });
        }
    };
    
    const handleFocusIncident = (incident: Incident) => {
        // Now allows focusing on any incident, verified or not
        setSelectedIncidentId(incident.id);
        setMapView({ center: [incident.lat, incident.lon], zoom: 16 });
    };

    if (loading) return <div className="flex items-center justify-center h-full"><p>Loading dashboard...</p></div>;
    if (error) return <div className="flex items-center justify-center h-full"><p className="text-red-500">Error: {error}</p></div>;

    return (
        <div className="flex flex-col h-full bg-neutral-950">
            <Header
                title="Dashboard"
                liveFeedEvents={liveFeedEvents}
                onFocusIncident={handleFocusIncident}
                latency={latency}
                onLatencyChange={setLatency}
                currentUser={currentUser}
                onUserChange={setCurrentUser}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <KpiCards incidents={incidents} />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 flex flex-col gap-6">
                         <div className="lg:hidden">
                            <button 
                                onClick={() => setIsFiltersDrawerOpen(true)}
                                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white font-semibold"
                            >
                                <Filter size={18} />
                                <span>Filters</span>
                            </button>
                        </div>
                        <FiltersPanel 
                            filters={filters} 
                            onFilterChange={(f) => { setFilters(f); setCurrentPage(1); setMapView(null); }} 
                            incidentTypes={incidentTypes}
                            severityLabels={SEVERITY_LABELS}
                        />
                        <IncidentTable
                            incidents={paginatedIncidents}
                            onSort={(key) => {
                                let direction: 'asc' | 'desc' = 'asc';
                                if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
                                setSortConfig({ key, direction });
                                setCurrentPage(1);
                            }}
                            sortConfig={sortConfig}
                            currentPage={currentPage}
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={sortedIncidents.length}
                            onPageChange={setCurrentPage}
                            selectedIncidentId={selectedIncidentId}
                            onRowSelect={handleSelectIncident}
                            newIncidentIds={newIncidentIds}
                        />
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-6 min-h-[400px]">
                         <div className="flex-[3_3_0%] min-h-[400px]">
                            <IncidentMap 
                                incidents={filteredIncidents}
                                onMarkerSelect={handleSelectIncident}
                                selectedIncidentId={selectedIncidentId}
                                newIncidentIds={newIncidentIds}
                                mapView={mapView}
                            />
                         </div>
                         <div className="flex-[2_2_0%] min-h-[300px]">
                            <ActivityPanel
                                socialPosts={socialPosts}
                                onPromoteToIncident={() => {}}
                                alertRules={alertRules}
                                alertLogs={alertLogs}
                                onRuleChange={() => {}}
                            />
                         </div>
                    </div>
                </div>
            </main>
            <IncidentDetailDrawer 
                incident={selectedIncident}
                isOpen={!!selectedIncidentId}
                onClose={() => handleSelectIncident(null)}
            />
            <FiltersDrawer
                isOpen={isFiltersDrawerOpen}
                onClose={() => setIsFiltersDrawerOpen(false)}
                filters={filters}
                onFilterChange={(f) => { setFilters(f); setCurrentPage(1); setMapView(null); }}
                incidentTypes={incidentTypes}
                severityLabels={SEVERITY_LABELS}
            />
        </div>
    );
};

export default DashboardPage;