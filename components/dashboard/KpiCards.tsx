
import React from 'react';
import { Incident } from '../../types';
import StatCard from './StatCard';
import { FileCheck, Hourglass, ListChecks, FileHeart } from 'lucide-react';

interface KpiCardsProps {
  incidents: Incident[];
}

const KpiCards: React.FC<KpiCardsProps> = ({ incidents }) => {
  const activeIncidents = incidents.filter(i => i.status === 'In Progress' || i.status === 'Reported').length;
  
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const verifiedToday = incidents.filter(i => new Date(i.timestamp) >= startOfToday && i.isVerified).length;

  const claimsFiled = incidents.filter(i => i.fnol && i.fnol.status !== 'None').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={<Hourglass size={24} className="text-yellow-500" />} title="Active Incidents" value={activeIncidents.toString()} />
      <StatCard icon={<ListChecks size={24} className="text-primary-500" />} title="Verified Today" value={verifiedToday.toString()} />
      <StatCard icon={<FileHeart size={24} className="text-green-500" />} title="Claims Filed" value={claimsFiled.toString()} />
      <StatCard icon={<FileCheck size={24} className="text-orange-500" />} title="Avg. Resolution" value={"4h 15m"} />
    </div>
  );
};

export default KpiCards;
