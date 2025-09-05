
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Map, List, Settings, LifeBuoy, ClipboardCheck, ShieldOff } from 'lucide-react';

interface NavItemProps {
  to?: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

// Component defined outside the parent component's render scope to prevent re-creation
const NavItem: React.FC<NavItemProps> = ({ to, icon, label, disabled = false }) => {
  const commonClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200";

  if (disabled) {
    return (
      <span className={`${commonClasses} text-neutral-500 cursor-not-allowed`}>
        {icon}
        <span className="ml-4">{label}</span>
      </span>
    );
  }
  
  return (
    <NavLink
      to={to || '#'}
      className={({ isActive }) =>
        `${commonClasses} ${
          isActive
            ? 'bg-primary-600 text-white'
            : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
        }`
      }
    >
      {icon}
      <span className="ml-4">{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
    return (
        <aside className="hidden md:flex flex-col w-64 bg-neutral-800 border-r border-neutral-700">
            <div className="flex items-center justify-center h-20 border-b border-neutral-700">
                 <ShieldCheck className="h-8 w-8 text-primary-500" />
                 <h1 className="ml-3 text-xl font-bold text-white">IncidentRM</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                <NavItem to="/moderation" icon={<ClipboardCheck size={20} />} label="Moderation" />
                <NavItem to="/privacy" icon={<ShieldOff size={20} />} label="Privacy Center" />
                <NavItem icon={<Map size={20} />} label="Map View" disabled />
                <NavItem icon={<List size={20} />} label="Incidents" disabled />
                <NavItem icon={<Settings size={20} />} label="Settings" disabled />
            </nav>
            <div className="px-4 py-6 border-t border-neutral-700">
                <NavItem icon={<LifeBuoy size={20} />} label="Help & Support" disabled />
            </div>
        </aside>
    );
};

export default Sidebar;