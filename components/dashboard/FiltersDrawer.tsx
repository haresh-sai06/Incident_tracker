import React from 'react';
import FilterInputs from './FilterInputs';
import { Filters } from './FiltersPanel';
import { X } from 'lucide-react';

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  incidentTypes: string[];
  severityLabels: { [key: number]: string };
}

const FiltersDrawer: React.FC<FiltersDrawerProps> = ({ isOpen, onClose, filters, onFilterChange, incidentTypes, severityLabels }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-neutral-800 border-l border-neutral-700 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-neutral-700">
            <h2 className="text-xl font-bold text-white">Filters</h2>
            <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Close filters">
              <X size={24} />
            </button>
          </header>
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <FilterInputs
                filters={filters}
                onFilterChange={onFilterChange}
                incidentTypes={incidentTypes}
                severityLabels={severityLabels}
              />
            </div>
          </div>
          <footer className="p-4 bg-neutral-900/50 border-t border-neutral-700">
            <button onClick={onClose} className="w-full py-2.5 px-4 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold">
              Apply Filters
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default FiltersDrawer;
