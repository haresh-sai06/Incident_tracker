
export interface User {
  id: string;
  name: string;
  role: 'Operator' | 'Partner';
  agency?: string;
  consents?: {
      type: 'terms_of_service' | 'data_sharing';
      timestamp: string;
      version: string;
  }[];
  deletionRequest?: {
      requestedAt: string;
      status: 'pending' | 'completed';
  } | null;
}

export interface AuditLogEntry {
  user: string;
  role: string;
  timestamp: string;
  action: string;
  comment: string;
}

export interface FnolStatus {
  status: 'None' | 'Submitted' | 'Accepted' | 'Rejected';
  claimId?: string;
  lastUpdated: string;
}

export interface Incident {
  id: string;
  lat: number;
  lon: number;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'In Progress' | 'Resolved' | 'Closed';
  timestamp: string;
  reporter_name: string;
  source: string;
  media: string[];
  isVerified: boolean;
  isFlagged?: boolean;
  notes?: string[];
  breadcrumb?: {
    ts: string;
    lat: number;
    lon: number;
  }[];
  claimedBy?: string; // User ID
  auditLog: AuditLogEntry[];
  fnol?: FnolStatus;
  isAnonymized?: boolean;
}

export interface SocialPost {
  id: string;
  timestamp: string;
  author: string;
  content: string;
  source: 'Twitter' | 'Facebook' | 'Instagram';
}

export interface ClassifiedSocialPost extends SocialPost {
  classification: 'hazard' | 'noise';
  sentiment: number; // e.g., -1 to 1
  keywords: string[];
}

// --- Alerting System Types ---

export type AlertRecipientType = 'email' | 'sms' | 'push' | 'ivr';

export interface AlertRecipient {
  type: AlertRecipientType;
  target: string;
}

export interface AlertAction {
  template_id: string;
  recipients: AlertRecipient[];
}

export type AlertConditionType = 'density' | 'single_incident';

export interface BaseAlertConditions {
  type: AlertConditionType;
  severity_threshold: Incident['severity'];
}

export interface DensityAlertConditions extends BaseAlertConditions {
  type: 'density';
  incident_count_threshold: number;
  time_window_minutes: number;
  radius_meters: number;
}

export interface SingleIncidentAlertConditions extends BaseAlertConditions {
  type: 'single_incident';
}

export type AlertConditions = DensityAlertConditions | SingleIncidentAlertConditions;

export interface AlertRule {
  id: string;
  name: string;
  isEnabled: boolean;
  conditions: AlertConditions;
  action: AlertAction;
}

export interface AlertTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface AlertLog {
  id: string;
  timestamp: string;
  rule_id: string;
  rule_name: string;
  triggered_by: string; // e.g., incident ID or "cluster"
  dispatched_message: string;
  recipients: AlertRecipient[];
}