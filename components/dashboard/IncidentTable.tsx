import React from 'react';
import { Incident } from '../../types';

export type SortableKeys = 'timestamp' | 'severity';
export type SortConfig = {
  key: SortableKeys;
  direction: 'asc' | 'desc';
};

interface IncidentTableProps {
  incidents: Incident[];
  onSort: (key: SortableKeys) => void;
  sortConfig: SortConfig | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  selectedIncidentId: string | null;
  onRowSelect: (incidentId: string | null) => void;
  newIncidentIds: Set<string>;
}

const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onSort,
  sortConfig,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  selectedIncidentId,
  onRowSelect,
  newIncidentIds,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-neutral-900 rounded-xl shadow overflow-hidden">
      <table className="min-w-full divide-y divide-neutral-700">
        <thead className="bg-neutral-800">
          <tr>
            <th
              onClick={() => onSort('timestamp')}
              className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer"
            >
              Timestamp {sortConfig?.key === 'timestamp' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th
              onClick={() => onSort('severity')}
              className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer"
            >
              Severity {sortConfig?.key === 'severity' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
              Location
            </th>
          </tr>
        </thead>
        <tbody className="bg-neutral-900 divide-y divide-neutral-800">
          {incidents.map((incident, index) => {
            // Ensure unique key
            const safeKey = `${incident.id || 'noid'}-${incident.timestamp}-${index}`;

            return (
              <tr
                key={safeKey}
                onClick={() => onRowSelect(incident.id)}
                className={`cursor-pointer ${
                  selectedIncidentId === incident.id ? 'bg-neutral-700' : 'hover:bg-neutral-800'
                } ${newIncidentIds.has(incident.id) ? 'animate-pulse bg-green-800/30' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-200">
                  {new Date(incident.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-200">
                  {incident.severity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-200">
                  {incident.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-200">
                  {incident.lat.toFixed(3)}, {incident.lon.toFixed(3)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="px-6 py-3 bg-neutral-800 flex justify-between items-center">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-neutral-700 text-white disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-neutral-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-neutral-700 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default IncidentTable;
