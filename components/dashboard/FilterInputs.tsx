import React from 'react';
import { Filters } from './FiltersPanel';

interface FilterInputsProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  incidentTypes: string[];
  severityLabels: { [key: number]: string };
}

const FilterInputs: React.FC<FilterInputsProps> = ({ filters, onFilterChange, incidentTypes, severityLabels }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
      <div>
        <label htmlFor="dateStart" className="block text-sm font-medium text-neutral-300 mb-1">Start Date</label>
        <input
          type="date"
          id="dateStart"
          name="dateStart"
          value={filters.dateStart}
          onChange={handleInputChange}
          className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500"
          aria-label="Filter by start date"
        />
      </div>
      <div>
        <label htmlFor="dateEnd" className="block text-sm font-medium text-neutral-300 mb-1">End Date</label>
        <input
          type="date"
          id="dateEnd"
          name="dateEnd"
          value={filters.dateEnd}
          onChange={handleInputChange}
          className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500"
          aria-label="Filter by end date"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-neutral-300 mb-1">Incident Type</label>
        <select
          id="type"
          name="type"
          value={filters.type}
          onChange={handleInputChange}
          className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500"
          aria-label="Filter by incident type"
        >
          <option value="">All Types</option>
          {incidentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="severity" className="block text-sm font-medium text-neutral-300 mb-1">
          Min. Severity: <span className="font-bold text-primary-400">{severityLabels[filters.severity]}</span>
        </label>
        <input
          type="range"
          id="severity"
          name="severity"
          min="1"
          max="4"
          step="1"
          value={filters.severity}
          onChange={handleInputChange}
          className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
          aria-label="Filter by minimum severity"
        />
      </div>
    </div>
  );
};

export default FilterInputs;
