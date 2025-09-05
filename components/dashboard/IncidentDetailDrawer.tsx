import React, { useState, useEffect, useRef } from 'react';
import { Incident } from '../../types';
import Lightbox from './Lightbox';
import FnolConsentModal from './FnolConsentModal';
import * as api from '../../utils/api';
// FIX: Added 'FileHeart' to the import list from lucide-react.
import { X, User, MapPin, Clock, ShieldCheck, Flag, ChevronsRight, Loader2, KeyRound, Building, FileClock, CheckCircle, XCircle, AlertTriangle, FileUp, FileQuestion, FileHeart, ShieldOff } from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3">
        <div className="mt-1 text-neutral-400">{icon}</div>
        <div>
            <p className="text-sm text-neutral-400">{label}</p>
            <p className="font-medium text-white break-words">{value}</p>
        </div>
    </div>
);

const FnolStatusDisplay: React.FC<{ incident: Incident }> = ({ incident }) => {
    if (!incident.fnol || incident.fnol.status === 'None') return null;

    const statusMap = {
        Submitted: { icon: <FileUp size={20} />, label: "Submitted", color: "text-blue-400" },
        Accepted: { icon: <CheckCircle size={20} />, label: "Accepted", color: "text-green-400" },
        Rejected: { icon: <XCircle size={20} />, label: "Rejected", color: "text-red-400" },
    };

    const currentStatus = statusMap[incident.fnol.status as keyof typeof statusMap] || { icon: <FileQuestion size={20}/>, label: 'Unknown', color: 'text-neutral-400'};

    return (
        <div>
            <h3 className="text-base font-semibold text-white mb-3">FNOL Status</h3>
            <div className="space-y-4 p-4 bg-neutral-900/50 rounded-lg">
                <DetailItem icon={<div className={currentStatus.color}>{currentStatus.icon}</div>} label="Claim Status" value={currentStatus.label} />
                {incident.fnol.claimId && <DetailItem icon={<KeyRound size={20} />} label="Claim ID" value={<code className="text-xs text-green-400">{incident.fnol.claimId}</code>} />}
                <DetailItem icon={<Clock size={20} />} label="Last Update" value={new Date(incident.fnol.lastUpdated).toLocaleString()} />
            </div>
        </div>
    );
}

const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({ incident, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isFnolConsentOpen, setIsFnolConsentOpen] = useState(false);
  const [isSubmittingFnol, setIsSubmittingFnol] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const FNOL_ELIGIBLE_TYPES = ['Theft', 'Vandalism', 'Traffic Accident', 'Fire'];


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isFnolConsentOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isFnolConsentOpen]);


  const handleAddNote = () => {
    if (newNote.trim() && incident) {
      api.post(`http://localhost:4000/api/incidents/${incident.id}/note`, { note: newNote.trim() });
      setNewNote('');
    }
  };
  
  const handleCreateFnol = async () => {
    if (!incident) return;
    setIsSubmittingFnol(true);
    await api.post('/api/insurer/fnol', { incidentId: incident.id });
    // The UI will update via WebSocket. We can close the modal optimistically.
    setIsSubmittingFnol(false);
    setIsFnolConsentOpen(false);
  };

  if (!incident) return null;
  
  const canCreateFnol = incident.isVerified && FNOL_ELIGIBLE_TYPES.includes(incident.type) && (!incident.fnol || incident.fnol.status === 'None');

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} aria-hidden="true" />
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-800 border-l border-neutral-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" aria-labelledby="drawer-title" aria-modal="true"
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-neutral-700 flex-shrink-0">
            <div>
              <h2 id="drawer-title" className="text-xl font-bold text-white">{incident.type}</h2>
              <p className="text-sm text-neutral-400 font-mono">ID: {incident.id}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Close details"><X size={24} /></button>
          </header>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-8">
            {incident.isAnonymized && (
                <div className="p-3 rounded-md bg-yellow-500/10 text-yellow-400 text-sm flex items-center space-x-3">
                    <ShieldOff size={20} />
                    <span>This incident's data has been partially anonymized due to retention policies.</span>
                </div>
            )}
            <div className="space-y-4">
                <DetailItem icon={<Clock size={20} />} label="Timestamp" value={new Date(incident.timestamp).toLocaleString()} />
                <DetailItem icon={<MapPin size={20} />} label="Location" value={`${incident.lat.toFixed(4)}, ${incident.lon.toFixed(4)}`} />
                <DetailItem icon={<User size={20} />} label="Reporter" value={incident.reporter_name} />
                {incident.claimedBy && <DetailItem icon={<Building size={20} />} label="Claimed By" value={incident.claimedBy} />}
            </div>
            
            <FnolStatusDisplay incident={incident} />

            {incident.media.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Media Gallery</h3>
                <div className="grid grid-cols-3 gap-3">
                  {incident.media.map((url, index) => (
                    <button key={index} onClick={() => setSelectedImage(url)} className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg">
                      <img src={url} alt={`Incident media ${index + 1}`} className="rounded-lg object-cover aspect-video hover:opacity-80 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base font-semibold text-white mb-3">Notes</h3>
              <div className="space-y-3">
                {incident.notes && incident.notes.length > 0 ? (
                  <ul className="space-y-2">
                    {incident.notes.map((note, i) => <li key={i} className="text-sm p-3 bg-neutral-700/50 rounded-md text-neutral-300">{note}</li>)}
                  </ul>
                ) : <p className="text-sm text-neutral-500">No notes added.</p>}
                <div className="flex space-x-2">
                  <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a new note..." className="flex-grow bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:ring-primary-500 focus:border-primary-500" />
                  <button onClick={handleAddNote} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-neutral-600" disabled={!newNote.trim()}>Save</button>
                </div>
              </div>
            </div>

            <div>
                <h3 className="text-base font-semibold text-white mb-3 flex items-center"><FileClock size={18} className="mr-2 text-primary-400" />Audit Log</h3>
                <ul className="space-y-3 text-sm">
                    {incident.auditLog.slice().reverse().map((log, i) => (
                        <li key={i} className="flex items-start space-x-3">
                            <div className="mt-1 w-2 h-2 rounded-full bg-neutral-600 flex-shrink-0" />
                            <div>
                                <p className="text-neutral-300">
                                    <span className="font-semibold text-white">{log.action}</span> by <span className="font-medium">{log.user} ({log.role})</span>
                                </p>
                                <p className="text-xs text-neutral-500">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
          </div>

          <footer className="p-4 bg-neutral-900/50 border-t border-neutral-700 flex-shrink-0">
            <h3 className="text-base font-semibold text-white mb-3">Actions</h3>
            <div className="grid grid-cols-1 gap-3">
                {canCreateFnol ? (
                    <button onClick={() => setIsFnolConsentOpen(true)} className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md transition-colors bg-green-600 hover:bg-green-700 text-white font-semibold">
                       <FileHeart size={18} /><span>Create Insurance Claim (FNOL)</span>
                    </button>
                ) : (
                    <div className="flex items-center space-x-2 text-sm p-2 rounded-md bg-neutral-700/50 text-neutral-400">
                        <AlertTriangle size={16} />
                        <span>FNOL cannot be created for this incident.</span>
                    </div>
                )}
            </div>
          </footer>
        </div>
      </div>
      {selectedImage && <Lightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      <FnolConsentModal 
        isOpen={isFnolConsentOpen}
        onClose={() => setIsFnolConsentOpen(false)}
        onConfirm={handleCreateFnol}
        isSubmitting={isSubmittingFnol}
      />
    </>
  );
};

export default IncidentDetailDrawer;