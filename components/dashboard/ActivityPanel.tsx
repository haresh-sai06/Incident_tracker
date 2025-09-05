import React, { useState } from 'react';
import SocialFeed from './SocialFeed';
import AlertsPanel from './AlertsPanel';
import { ClassifiedSocialPost, AlertRule, AlertLog } from '../../types';
import { Rss, Siren } from 'lucide-react';

interface ActivityPanelProps {
  socialPosts: ClassifiedSocialPost[];
  onPromoteToIncident: (post: ClassifiedSocialPost) => void;
  alertRules: AlertRule[];
  alertLogs: AlertLog[];
  onRuleChange: () => void;
}

type ActiveTab = 'social' | 'alerts';

const ActivityPanel: React.FC<ActivityPanelProps> = ({ socialPosts, onPromoteToIncident, alertRules, alertLogs, onRuleChange }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('social');

  const getTabClass = (tabName: ActiveTab) =>
    `flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      activeTab === tabName
        ? 'border-primary-500 text-white'
        : 'border-transparent text-neutral-400 hover:text-white'
    }`;

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 h-full flex flex-col">
      <div className="flex border-b border-neutral-700 px-4">
        <button onClick={() => setActiveTab('social')} className={getTabClass('social')}>
          <Rss size={16} />
          <span>Social Feed</span>
        </button>
        <button onClick={() => setActiveTab('alerts')} className={getTabClass('alerts')}>
          <Siren size={16} />
          <span>Alerts</span>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'social' && (
          <SocialFeed posts={socialPosts} onPromote={onPromoteToIncident} />
        )}
        {activeTab === 'alerts' && (
          <AlertsPanel rules={alertRules} logs={alertLogs} onRuleChange={onRuleChange} />
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;
