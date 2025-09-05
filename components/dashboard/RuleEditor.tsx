import React, { useState, useEffect, useCallback } from 'react';
import { AlertRule, AlertTemplate, DensityAlertConditions, SingleIncidentAlertConditions } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface RuleEditorProps {
    rule: AlertRule | null;
    onClose: () => void;
    onSave: () => void;
}

const defaultRule: Omit<AlertRule, 'id'> = {
    name: 'New Alert Rule',
    isEnabled: true,
    conditions: {
        type: 'density',
        severity_threshold: 'High',
        incident_count_threshold: 3,
        time_window_minutes: 10,
        radius_meters: 500,
    },
    action: {
        template_id: '',
        recipients: [{ type: 'email', target: '' }],
    }
};

const RuleEditor: React.FC<RuleEditorProps> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<AlertRule, 'id'>>(rule ? JSON.parse(JSON.stringify(rule)) : defaultRule);
    const [templates, setTemplates] = useState<AlertTemplate[]>([]);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/templates');
                const data = await res.json();
                setTemplates(data);
                if (!rule) {
                    setFormData(prev => ({...prev, action: {...prev.action, template_id: data[0]?.id || ''}}));
                }
            } catch (e) {
                console.error("Could not fetch templates", e);
            }
        };
        fetchTemplates();
    }, [rule]);

    const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, [name]: name.startsWith('incident') || name.startsWith('time') || name.startsWith('radius') ? parseInt(value, 10) : value } }));
    };

    const handleRecipientChange = (index: number, field: 'type' | 'target', value: string) => {
        const newRecipients = [...formData.action.recipients];
        newRecipients[index] = { ...newRecipients[index], [field]: value };
        setFormData(prev => ({ ...prev, action: { ...prev.action, recipients: newRecipients } }));
    };

    const addRecipient = () => {
        setFormData(prev => ({ ...prev, action: { ...prev.action, recipients: [...prev.action.recipients, { type: 'email', target: '' }] } }));
    };

    const removeRecipient = (index: number) => {
        const newRecipients = formData.action.recipients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, action: { ...prev.action, recipients: newRecipients } }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const url = rule ? `/api/rules/${rule.id}` : '/api/rules';
            const method = rule ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(err || 'Failed to save rule');
            }
            onSave();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    };
    
    const onConditionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as 'density' | 'single_incident';
        let newConditions: DensityAlertConditions | SingleIncidentAlertConditions;
        if (type === 'density') {
            newConditions = {
                type: 'density',
                severity_threshold: 'High',
                incident_count_threshold: 3,
                time_window_minutes: 10,
                radius_meters: 500,
            };
        } else {
            newConditions = {
                type: 'single_incident',
                severity_threshold: 'Critical',
            };
        }
        setFormData(prev => ({...prev, conditions: newConditions}));
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <h2 className="text-xl font-bold text-white">{rule ? 'Edit Rule' : 'Create New Rule'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-1">Rule Name</label>
                        <input type="text" id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white" required />
                    </div>
                    
                    {/* Conditions Section */}
                    <fieldset className="p-4 border border-neutral-700 rounded-md">
                        <legend className="text-lg font-semibold text-white px-2">Conditions</legend>
                        <div className="space-y-4 mt-2">
                             <div>
                                <label htmlFor="type" className="block text-sm font-medium text-neutral-300 mb-1">Condition Type</label>
                                <select id="type" name="type" value={formData.conditions.type} onChange={onConditionTypeChange} className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white">
                                    <option value="density">Incident Density</option>
                                    <option value="single_incident">Single Incident</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="severity_threshold" className="block text-sm font-medium text-neutral-300 mb-1">Severity Threshold</label>
                                <select id="severity_threshold" name="severity_threshold" value={formData.conditions.severity_threshold} onChange={handleConditionChange} className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            {formData.conditions.type === 'density' && (
                                <>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="incident_count_threshold" className="block text-sm font-medium text-neutral-300 mb-1">Incidents</label>
                                            <input type="number" id="incident_count_threshold" name="incident_count_threshold" min="1" value={formData.conditions.incident_count_threshold} onChange={handleConditionChange} className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white" />
                                        </div>
                                        <div>
                                            <label htmlFor="radius_meters" className="block text-sm font-medium text-neutral-300 mb-1">Radius (m)</label>
                                            <input type="number" id="radius_meters" name="radius_meters" min="1" value={formData.conditions.radius_meters} onChange={handleConditionChange} className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white" />
                                        </div>
                                         <div>
                                            <label htmlFor="time_window_minutes" className="block text-sm font-medium text-neutral-300 mb-1">Time (min)</label>
                                            <input type="number" id="time_window_minutes" name="time_window_minutes" min="1" value={formData.conditions.time_window_minutes} onChange={handleConditionChange} className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </fieldset>

                    {/* Actions Section */}
                    <fieldset className="p-4 border border-neutral-700 rounded-md">
                        <legend className="text-lg font-semibold text-white px-2">Action</legend>
                        <div className="space-y-4 mt-2">
                            <div>
                                <label htmlFor="template_id" className="block text-sm font-medium text-neutral-300 mb-1">Message Template</label>
                                <select id="template_id" value={formData.action.template_id} onChange={e => setFormData({...formData, action: {...formData.action, template_id: e.target.value}})} className="w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white">
                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-300 mb-2">Recipients</h4>
                                <div className="space-y-2">
                                    {formData.action.recipients.map((rec, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <select value={rec.type} onChange={e => handleRecipientChange(i, 'type', e.target.value)} className="bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white">
                                                <option value="email">Email</option>
                                                <option value="sms">SMS</option>
                                                <option value="push">Push</option>
                                                <option value="ivr">IVR</option>
                                            </select>
                                            <input type="text" placeholder="target@example.com or +1..." value={rec.target} onChange={e => handleRecipientChange(i, 'target', e.target.value)} className="flex-grow bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white" required />
                                            <button type="button" onClick={() => removeRecipient(i)} className="p-2 text-neutral-400 hover:text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addRecipient} className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300">
                                        <Plus size={16} /><span>Add Recipient</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    
                </form>
                <div className="p-4 border-t border-neutral-700 flex justify-end space-x-3">
                    {error && <p className="text-sm text-red-500 self-center mr-auto">{error}</p>}
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-600 hover:bg-neutral-500 text-white">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 hover:bg-primary-700 text-white">Save Rule</button>
                </div>
            </div>
        </div>
    );
};

export default RuleEditor;
