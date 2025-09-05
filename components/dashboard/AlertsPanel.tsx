import React, { useState } from 'react';
import { AlertRule, AlertLog } from '../../types';
import { Siren, Book, SlidersHorizontal, Trash2, Pencil, PlusCircle, Check, X } from 'lucide-react';
import RuleEditor from './RuleEditor';

interface AlertsPanelProps {
    rules: AlertRule[];
    logs: AlertLog[];
    onRuleChange: () => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ rules, logs, onRuleChange }) => {
    const [view, setView] = useState<'logs' | 'rules'>('logs');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);

    const handleEditRule = (rule: AlertRule) => {
        setSelectedRule(rule);
        setIsEditorOpen(true);
    };

    const handleCreateRule = () => {
        setSelectedRule(null);
        setIsEditorOpen(true);
    };
    
    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        try {
            const response = await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete rule');
            onRuleChange();
        } catch (error) {
            console.error("Delete failed:", error);
            alert('Failed to delete rule. See console for details.');
        }
    };
    
    const handleToggleRule = async (rule: AlertRule) => {
        try {
            const response = await fetch(`/api/rules/${rule.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...rule, isEnabled: !rule.isEnabled }),
            });
            if (!response.ok) throw new Error('Failed to toggle rule');
            onRuleChange();
        } catch (error) {
            console.error("Toggle failed:", error);
        }
    }

    const getRuleSummary = (rule: AlertRule) => {
        const { conditions } = rule;
        if (conditions.type === 'density') {
            return `> ${conditions.incident_count_threshold} incidents (Sev: ${conditions.severity_threshold}+) in ${conditions.radius_meters}m within ${conditions.time_window_minutes} min.`;
        }
        if (conditions.type === 'single_incident') {
            return `Any single incident with severity ${conditions.severity_threshold} or higher.`;
        }
        return 'Unknown condition type.';
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-neutral-700/50 flex-shrink-0">
                <div className="flex items-center space-x-2 text-sm">
                    <button onClick={() => setView('logs')} className={`px-3 py-1 rounded-md flex items-center space-x-1.5 ${view === 'logs' ? 'bg-primary-600 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}`}>
                        <Book size={14} /><span>Logs</span>
                    </button>
                    <button onClick={() => setView('rules')} className={`px-3 py-1 rounded-md flex items-center space-x-1.5 ${view === 'rules' ? 'bg-primary-600 text-white' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}`}>
                       <SlidersHorizontal size={14} /><span>Rules</span>
                    </button>
                </div>
                 {view === 'rules' && (
                    <button onClick={handleCreateRule} className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors py-1 px-2 rounded-md hover:bg-primary-500/10">
                        <PlusCircle size={16} /><span>New Rule</span>
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-y-auto">
                {view === 'logs' && (
                    logs.length > 0 ? (
                        <ul className="divide-y divide-neutral-700/50">
                            {logs.map(log => (
                                <li key={log.id} className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <Siren size={18} className="text-orange-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{log.rule_name}</p>
                                            <p className="text-xs text-neutral-400 mb-2">{new Date(log.timestamp).toLocaleString()}</p>
                                            <p className="text-xs p-2 bg-neutral-900 rounded-md text-neutral-300 font-mono">{log.dispatched_message}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="p-6 text-center text-sm text-neutral-500">No alerts triggered yet.</p>
                )}
                {view === 'rules' && (
                     rules.length > 0 ? (
                        <ul className="divide-y divide-neutral-700/50">
                            {rules.map(rule => (
                                <li key={rule.id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                 <button onClick={() => handleToggleRule(rule)} className={`p-1 rounded-full ${rule.isEnabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                    {rule.isEnabled ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-red-400" />}
                                                </button>
                                                <p className="text-sm font-semibold text-white truncate">{rule.name}</p>
                                            </div>
                                            <p className="text-xs text-neutral-400 mt-1 ml-8">{getRuleSummary(rule)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-2">
                                            <button onClick={() => handleEditRule(rule)} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-700"><Pencil size={14} /></button>
                                            <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-neutral-400 hover:text-red-400 rounded-full hover:bg-neutral-700"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="p-6 text-center text-sm text-neutral-500">No rules configured.</p>
                )}
            </div>
            {isEditorOpen && (
                <RuleEditor
                    rule={selectedRule}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={() => {
                        onRuleChange();
                        setIsEditorOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default AlertsPanel;
