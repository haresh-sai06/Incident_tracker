import React from 'react';
import FilterInputs from './FilterInputs';

export interface Filters {
  dateStart: string;
  dateEnd: string;
  type: string;
  severity: number;
}

interface FiltersPanelProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  incidentTypes: string[];
  severityLabels: { [key: number]: string };
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ filters, onFilterChange, incidentTypes, severityLabels }) => {
  return (
    <div className="hidden lg:block bg-neutral-800 p-4 rounded-lg border border-neutral-700">
      <FilterInputs 
        filters={filters}
        onFilterChange={onFilterChange}
        incidentTypes={incidentTypes}
        severityLabels={severityLabels}
      />
    </div>
  );
};

export default FiltersPanel;
