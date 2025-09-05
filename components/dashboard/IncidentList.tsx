
import React from 'react';
import { Incident } from '../../types';

// Helper components are defined outside the main component to prevent re-creation on re-renders.
const SeverityBadge: React.FC<{ severity: Incident['severity'] }> = ({ severity }) => {
    const colorClasses = {
        'Low': 'bg-green-500/20 text-green-400',
        'Medium': 'bg-yellow-500/20 text-yellow-400',
        'High': 'bg-orange-500/20 text-orange-400',
        'Critical': 'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[severity]}`}>
            {severity}
        </span>
    );
};

const StatusBadge: React.FC<{ status: Incident['status'] }> = ({ status }) => {
    const colorClasses = {
        'Reported': 'bg-blue-500/20 text-blue-400',
        'In Progress': 'bg-purple-500/20 text-purple-400',
        'Resolved': 'bg-gray-500/20 text-gray-400',
        'Closed': 'bg-gray-600/20 text-gray-500',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[status]}`}>
            {status}
        </span>
    );
};

const IncidentItem: React.FC<{ incident: Incident }> = ({ incident }) => {
    return (
        <li className="py-3 px-1 hover:bg-neutral-700/50 rounded-md transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{incident.type}</p>
                    <p className="text-xs text-neutral-400">ID: {incident.id}</p>
                </div>
                <div className="flex flex-col items-end space-y-1 ml-2">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                </div>
            </div>
        </li>
    );
};

interface IncidentListProps {
    incidents: Incident[];
}

const IncidentList: React.FC<IncidentListProps> = ({ incidents }) => {
    return (
        <div className="bg-neutral-800 p-4 rounded-lg h-full border border-neutral-700 flex flex-col min-h-[640px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
                <button className="text-sm text-primary-500 hover:underline">View All</button>
            </div>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                 <ul className="divide-y divide-neutral-700">
                    {incidents.map(incident => (
                        <IncidentItem key={incident.id} incident={incident} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default IncidentList;
