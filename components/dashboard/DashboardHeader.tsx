import React from 'react';
import LiveFeed from './LiveFeed';
import { Incident } from '../../types';

interface DashboardHeaderProps {
  liveFeedEvents: Incident[];
  onFocusIncident: (incident: Incident) => void;
  latency: number;
  onLatencyChange: (latency: number) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ liveFeedEvents, onFocusIncident, latency, onLatencyChange }) => {
  return (
    <header className="bg-neutral-800 border-b border-neutral-700 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center space-x-4">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Tourist Safety Ops</h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <label htmlFor="latency" className="text-sm font-medium text-neutral-400">Sim Latency:</label>
            <select
              id="latency"
              name="latency"
              value={latency}
              onChange={(e) => onLatencyChange(Number(e.target.value))}
              className="bg-neutral-700 border border-neutral-600 rounded-md py-1 px-2 text-sm text-white focus:ring-primary-500 focus:border-primary-500"
              aria-label="Simulate network latency"
            >
              <option value="0">0s</option>
              <option value="5">5s</option>
              <option value="15">15s</option>
            </select>
          </div>
          <LiveFeed events={liveFeedEvents} onFocusIncident={onFocusIncident} />
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300">
            DEV
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
