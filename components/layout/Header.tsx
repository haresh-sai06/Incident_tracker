
import React from 'react';
import { Incident, User } from '../../types';
import LiveFeed from '../dashboard/LiveFeed';
import UserSwitcher from './UserSwitcher';

interface HeaderProps {
  title: string;
  liveFeedEvents: Incident[];
  onFocusIncident: (incident: Incident) => void;
  latency: number;
  onLatencyChange: (latency: number) => void;
  currentUser: User | null;
  onUserChange: (user: User) => void;
}

const Header: React.FC<HeaderProps> = ({ title, liveFeedEvents, onFocusIncident, latency, onLatencyChange, currentUser, onUserChange }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-neutral-800 border-b border-neutral-700">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="hidden sm:flex items-center space-x-2">
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
        <UserSwitcher currentUser={currentUser} onUserChange={onUserChange} />
      </div>
    </header>
  );
};

export default Header;
