import React, { useState, useRef, useEffect } from 'react';
import { Bell, Zap } from 'lucide-react';
import { Incident } from '../../types';

interface LiveFeedProps {
  events: Incident[];
  onFocusIncident: (incident: Incident) => void;
}

const LiveFeed: React.FC<LiveFeedProps> = ({ events, onFocusIncident }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (events.length > 0) {
      setHasUnread(true);
    }
  }, [events]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (hasUnread) {
      setHasUnread(false);
    }
  };

  const handleEventClick = (incident: Incident) => {
    onFocusIncident(incident);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative text-neutral-400 hover:text-white transition-colors"
        aria-label="Toggle live feed"
      >
        <Bell size={22} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-20">
          <div className="p-3 border-b border-neutral-700">
            <h4 className="font-semibold text-white">Live Feed</h4>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {events.length > 0 ? (
              events.map((event) => (
                <li key={event.id}>
                  <button
                    onClick={() => handleEventClick(event)}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-700/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <Zap size={16} className="text-primary-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{event.type}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(event.timestamp).toLocaleTimeString()} - Sev: {event.severity}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))
            ) : (
              <p className="p-4 text-sm text-neutral-500">No new events yet.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LiveFeed;
