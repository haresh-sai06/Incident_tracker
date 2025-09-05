// FIX: Use `import type` to explicitly import types from express and avoid conflicts with other libraries like node-fetch.
// FIX: Aliased Request and Response types to resolve type conflicts with other libraries.
import express from 'express';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
// FIX: Alias Request and Response to avoid type conflicts with other libraries (e.g., node-fetch, DOM).
import http from 'http';
// FIX: Corrected typo in 'https' import. Was 'https-'.
import https from 'https';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

interface User {
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

interface FnolStatus {
  status: 'None' | 'Submitted' | 'Accepted' | 'Rejected';
  claimId?: string;
  lastUpdated: string;
}

interface SocialPost {
  id: string;
  timestamp: string;
  author: string;
  content: string;
  source: 'Twitter' | 'Facebook' | 'Instagram';
}

interface AlertRule {
  id: string;
  name: string;
  isEnabled: boolean;
  conditions: AlertConditions;
  action: AlertAction;
}

interface AlertTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface AlertLog {
  id: string;
  timestamp: string;
  rule_id: string;
  rule_name: string;
  triggered_by: string; // e.g., incident ID or "cluster"
  dispatched_message: string;
  recipients: AlertRecipient[];
}

interface AlertRecipient {
  type: AlertRecipientType;
  target: string;
}

interface AlertAction {
  template_id: string;
  recipients: AlertRecipient[];
}

type AlertRecipientType = 'email' | 'sms' | 'push' | 'ivr';

type AlertConditions = DensityAlertConditions | SingleIncidentAlertConditions;

interface DensityAlertConditions extends BaseAlertConditions {
  type: 'density';
  incident_count_threshold: number;
  time_window_minutes: number;
  radius_meters: number;
}

interface SingleIncidentAlertConditions extends BaseAlertConditions {
  type: 'single_incident';
}

type AlertConditionType = 'density' | 'single_incident';

interface BaseAlertConditions {
  type: AlertConditionType;
  severity_threshold: Incident['severity'];
}

interface AuditLogEntry {
  user: string;
  role: string;
  timestamp: string;
  action: string;
  comment: string;
}

interface ClassifiedSocialPost extends SocialPost {
  classification: 'hazard' | 'noise';
  sentiment: number; // e.g., -1 to 1
  keywords: string[];
}

// --- NLP Classifier ---
const HAZARD_KEYWORDS: Record<string, number> = {
    fire: 5, crash: 5, accident: 5, police: 4, sirens: 4, emergency: 5,
    assault: 6, stolen: 4, gun: 7, help: 3, trapped: 5, injury: 5, theft: 4,
    vandalism: 3, smoke: 3, blocked: 2, explosion: 6, suspicious: 3, ambulance: 4,
};
const NOISE_KEYWORDS: Record<string, number> = {
    concert: -4, parade: -4, festival: -4, food: -3, music: -3, party: -3,
    sale: -4, great: -2, amazing: -2, beautiful: -2, fun: -2,
};
const NEGATIVE_SENTIMENT: Record<string, number> = {
    terrible: -3, awful: -3, scary: -4, bad: -2, avoid: -3, nightmare: -4,
    sad: -2, broken: -2,
};
const POSITIVE_SENTIMENT: Record<string, number> = {
    great: 2, amazing: 2, beautiful: 2, fun: 2, safe: 4, resolved: 3,
};
const HAZARD_THRESHOLD = 4;

export const classifyPost = (post: SocialPost): ClassifiedSocialPost => {
    const content = post.content.toLowerCase().replace(/[.,!?:;]/g, '');
    const tokens = content.split(/\s+/);
    let hazardScore = 0, sentimentScore = 0;
    const foundKeywords: { word: string, score: number }[] = [];

    tokens.forEach(token => {
        if (HAZARD_KEYWORDS[token]) {
            const score = HAZARD_KEYWORDS[token];
            hazardScore += score;
            foundKeywords.push({ word: token, score });
        }
        if (NOISE_KEYWORDS[token]) hazardScore += NOISE_KEYWORDS[token];
        if (NEGATIVE_SENTIMENT[token]) sentimentScore += NEGATIVE_SENTIMENT[token];
        if (POSITIVE_SENTIMENT[token]) sentimentScore += POSITIVE_SENTIMENT[token];
    });

    return {
        ...post,
        classification: hazardScore >= HAZARD_THRESHOLD ? 'hazard' : 'noise',
        sentiment: Math.max(-1, Math.min(1, sentimentScore / 5)), // Rough normalization
        keywords: foundKeywords.sort((a, b) => b.score - a.score).slice(0, 3).map(k => k.word),
    };
};

// --- Server Setup ---
// FIX: Explicitly typed 'app' as 'Express' to ensure correct type inference for its methods.
const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://5ju9udr1l600wwv1suh4zvfxqw9zsyofk5foy9870upry0prx9-h799512671.scf.usercontent.goog'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Middleware to parse JSON bodies

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(path.join(__dirname, '..', 'dist')));
app.use('/', express.static(path.join(__dirname, '..', 'public'))); // Serve public files like kiosk.html

const isProduction = process.env.NODE_ENV === 'production';
let server = isProduction ?
  https.createServer({
    cert: fs.readFileSync(process.env.SSL_CERT_PATH || 'path/to/cert.pem'),
    key: fs.readFileSync(process.env.SSL_KEY_PATH || 'path/to/key.pem')
  }, app) :
  http.createServer(app);

const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 4000;

// --- Data Loading & In-Memory Storage ---
const loadJsonData = <T>(fileName: string): T[] => {
  const dataPath = path.join(__dirname, '..', 'sample_data', fileName);
  try {
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    console.log(`Sample data loaded successfully from ${fileName}.`);
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to load sample data from ${fileName}:`, error);
    return [];
  }
};

let incidentsData = loadJsonData<Incident>('incidents.json');
const socialPostsData = loadJsonData<SocialPost>('social_posts.json');
let alertRules = loadJsonData<AlertRule>('alert_rules.json');
const alertTemplates = loadJsonData<AlertTemplate>('alert_templates.json');
let users = loadJsonData<User>('users.json');

let alertLogs: AlertLog[] = [];
// const ruleCooldowns = new Map<string, number>(); // ruleId -> timestamp
const processedActionIds = new Set<string>(); // For idempotency
// const RULE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
// const SEVERITY_MAP: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };

// --- User Simulation ---
let currentUser: User = users[0]; // Default to first user

// Initialize incidents with audit logs and FNOL status
incidentsData.forEach(inc => {
    if (!inc.auditLog) inc.auditLog = [];
    if (!inc.fnol) inc.fnol = { status: 'None', lastUpdated: inc.timestamp };
    // For sample data, assume some are unverified
    if (inc.isVerified === undefined) inc.isVerified = Math.random() < 0.7;
});


// --- WebSocket Logic ---
const broadcast = (data: object) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
  });
};

// --- Alerting Engine ---

// function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
//   const R = 6371e3; // metres
//   const φ1 = lat1 * Math.PI / 180;
//   const φ2 = lat2 * Math.PI / 180;
//   const Δφ = (lat2 - lat1) * Math.PI / 180;
//   const Δλ = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// function dispatchAlert(rule: AlertRule, context: Record<string, any>) {
//     const template = alertTemplates.find(t => t.id === rule.action.template_id);
//     if (!template) {
//         console.error(`[Alert Dispatcher] Template not found: ${rule.action.template_id}`);
//         return;
//     }

//     let messageBody = template.body;
//     for (const key in context) {
//         messageBody = messageBody.replace(new RegExp(`{{${key}}}`, 'g'), context[key]);
//     }

//     const logEntry: AlertLog = {
//         id: `log_${Date.now()}`,
//         timestamp: new Date().toISOString(),
//         rule_id: rule.id,
//         rule_name: rule.name,
//         triggered_by: context.incident_id || `Cluster of ${context.incident_count}`,
//         dispatched_message: messageBody,
//         recipients: rule.action.recipients,
//     };
//     alertLogs.unshift(logEntry); // Add to beginning
//     if (alertLogs.length > 100) alertLogs.pop(); // Keep logs trimmed

//     console.log(`\n--- ALERT DISPATCHED ---`);
//     console.log(`Rule: ${rule.name}`);
//     console.log(`Message: ${messageBody}`);
//     rule.action.recipients.forEach(r => {
//         console.log(`  -> Mock sending to [${r.type.toUpperCase()}] at ${r.target}`);
//     });
//     console.log(`------------------------\n`);
    
//     broadcast({ type: 'new-alert-log', payload: logEntry });
// }

// function evaluateRules(newIncident: Incident) {
//     const now = Date.now();
//     for (const rule of alertRules) {
//         if (!rule.isEnabled) continue;

//         const lastTrigger = ruleCooldowns.get(rule.id);
//         if (lastTrigger && (now - lastTrigger < RULE_COOLDOWN_MS)) continue;

//         const incidentSeverity = SEVERITY_MAP[newIncident.severity];
//         const ruleSeverity = SEVERITY_MAP[rule.conditions.severity_threshold];

//         if (incidentSeverity < ruleSeverity) continue;

//         if (rule.conditions.type === 'single_incident') {
//             dispatchAlert(rule, {
//                 incident_id: newIncident.id,
//                 incident_type: newIncident.type,
//                 incident_lat: newIncident.lat.toFixed(4),
//                 incident_lon: newIncident.lon.toFixed(4),
//             });
//             ruleCooldowns.set(rule.id, now);
//         }

//         if (rule.conditions.type === 'density') {
//             const { time_window_minutes, radius_meters, incident_count_threshold } = rule.conditions;
//             const timeWindowStart = now - time_window_minutes * 60 * 1000;

//             const recentIncidents = incidentsData.filter(i =>
//                 new Date(i.timestamp).getTime() >= timeWindowStart &&
//                 SEVERITY_MAP[i.severity] >= ruleSeverity
//             );
            
//             const cluster = recentIncidents.filter(i => 
//                 getDistanceInMeters(newIncident.lat, newIncident.lon, i.lat, i.lon) <= radius_meters
//             );

//             if (cluster.length >= incident_count_threshold) {
//                 dispatchAlert(rule, {
//                     incident_count: cluster.length,
//                     severity_threshold: rule.conditions.severity_threshold,
//                     radius_meters,
//                     time_window_minutes,
//                     center_lat: newIncident.lat.toFixed(4),
//                     center_lon: newIncident.lon.toFixed(4),
//                 });
//                 ruleCooldowns.set(rule.id, now);
//             }
//         }
//     }
// }

// --- Helper for Auditing ---
const addAuditLog = (incident: Incident, action: string, comment: string) => {
    const log: AuditLogEntry = {
        user: currentUser.name,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
        action,
        comment,
    };
    incident.auditLog.push(log);
};

// --- API Middlewares ---
const handleIdempotency = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const { actionId } = req.body;
    if (!actionId) return res.status(400).json({ message: 'actionId is required' });
    if (processedActionIds.has(actionId)) {
        console.log(`Idempotency: Duplicate action detected and skipped: ${actionId}`);
        return res.status(200).json({ message: 'Action already processed' });
    }
    next();
};

// --- API Routes ---

// User management
// FIX: Add explicit types for req and res to route handler to resolve type conflicts.
app.get('/api/users', (_req: ExpressRequest, res: ExpressResponse) => res.json(users));
// FIX: Add explicit types for req and res to route handler to resolve type conflicts.
app.get('/api/auth/current', (_req: ExpressRequest, res: ExpressResponse) => res.json(currentUser));
// FIX: Add explicit types for req and res to route handler.
app.post('/api/auth/switch', (req: ExpressRequest, res: ExpressResponse) => {
    const { userId } = req.body;
    const user = users.find(u => u.id === userId);
    if (user) {
        currentUser = user;
        res.json(currentUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});
// FIX: Add explicit types for req and res to route handler.
app.post('/api/users/request-deletion', (_: ExpressRequest, res: ExpressResponse) => {
    const user = users.find(u => u.id === currentUser.id);
    if (user) {
        if (!user.deletionRequest || user.deletionRequest.status === 'completed') {
            user.deletionRequest = {
                requestedAt: new Date().toISOString(),
                status: 'pending',
            };
        }
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: 'Current user not found' });
    }
});

// Admin routes
// FIX: Add explicit types for req and res to route handler.
app.get('/api/admin/deletion-requests', (_req: ExpressRequest, res: ExpressResponse) => {
    if (currentUser.role !== 'Operator') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const pendingRequests = users.filter(u => u.deletionRequest?.status === 'pending');
    res.json(pendingRequests);
});


// Incident data
// FIX: Add explicit types for req and res to route handler to resolve type conflicts.
app.get('/api/incidents', (_req: ExpressRequest, res: ExpressResponse) => {
    res.json(incidentsData.filter(i => i.isVerified));
});

// FIX: Add explicit types for req and res to route handler to resolve type conflicts.
app.get('/api/incidents/all', (_req: ExpressRequest, res: ExpressResponse) => {
    res.json(incidentsData);
});

// Moderation actions
const findIncident = (id: string, res: ExpressResponse): Incident | null => {
    const incident = incidentsData.find(i => i.id === id);
    if (!incident) {
        res.status(404).json({ message: 'Incident not found' });
        return null;
    }
    return incident;
};

// FIX: Add explicit types for req and res to route handler.
app.post('/api/incidents/:id/claim', handleIdempotency, (req: ExpressRequest, res: ExpressResponse) => {
    const incident = findIncident(req.params.id, res);
    if (!incident) return;
    incident.claimedBy = currentUser.id;
    addAuditLog(incident, 'Claim', `Incident claimed by ${currentUser.name}.`);
    processedActionIds.add(req.body.actionId);
    broadcast({ type: 'update-incident', payload: incident });
    res.json(incident);
});

// FIX: Add explicit types for req and res to route handler.
app.post('/api/incidents/:id/request-info', handleIdempotency, (req: ExpressRequest, res: ExpressResponse) => {
    const incident = findIncident(req.params.id, res);
    if (!incident) return;
    incident.isFlagged = true;
    if (!incident.notes) incident.notes = [];
    incident.notes.push('Moderator requested more information from the reporter.');
    addAuditLog(incident, 'Info Requested', `More information requested.`);
    processedActionIds.add(req.body.actionId);
    broadcast({ type: 'update-incident', payload: incident });
    res.json(incident);
});

// FIX: Add explicit types for req and res to route handler.
app.post('/api/incidents/:id/verify', handleIdempotency, (req: ExpressRequest, res: ExpressResponse) => {
    const incident = findIncident(req.params.id, res);
    if (!incident) return;
    incident.isVerified = true;
    addAuditLog(incident, 'Verify', `Incident verified.`);
    processedActionIds.add(req.body.actionId);
    broadcast({ type: 'update-incident', payload: incident });
    res.json(incident);
});

// FIX: Add explicit types for req and res to route handler.
app.post('/api/incidents/:id/reject', handleIdempotency, (req: ExpressRequest, res: ExpressResponse) => {
    const incident = findIncident(req.params.id, res);
    if (!incident) return;
    incident.status = 'Closed';
    incident.isVerified = false; // Explicitly mark as not verified
    addAuditLog(incident, 'Reject', `Incident rejected and closed.`);
    processedActionIds.add(req.body.actionId);
    broadcast({ type: 'update-incident', payload: incident });
    res.json(incident);
});

// FIX: Add explicit types for req and res to route handler.
app.post('/api/incidents/:id/note', handleIdempotency, (req: ExpressRequest, res: ExpressResponse) => {
    const incident = findIncident(req.params.id, res);
    if (!incident) return;
    const { note } = req.body;
    if (!note) return res.status(400).json({ message: 'Note content is required' });
    if (!incident.notes) incident.notes = [];
    incident.notes.push(note);
    addAuditLog(incident, 'Add Note', `Note added: "${note}"`);
    processedActionIds.add(req.body.actionId);
    broadcast({ type: 'update-incident', payload: incident });
    res.json(incident);
});


// FNOL submission endpoint (simulates sending to insurer)
// FIX: Add explicit types for req and res to route handler.
app.post('/api/insurer/fnol', handleIdempotency, (req: ExpressRequest, res: ExpressResponse) => {
    const { incidentId } = req.body;
    const incidentIndex = incidentsData.findIndex(inc => inc.id === incidentId);

    if (incidentIndex === -1) return res.status(404).json({ message: "Incident not found" });
    
    const incident = incidentsData[incidentIndex];

    const fnolPayload = {
        policyHolder: incident.reporter_name,
        incidentReference: incident.id,
        incidentTime: incident.timestamp,
        location: { lat: incident.lat, lon: incident.lon },
        description: `Incident of type '${incident.type}'. Notes: ${incident.notes?.join(' ') || 'N/A'}`,
        mediaUrls: incident.media,
    };

    console.log('--- FNOL PAYLOAD SENT TO INSURER ---');
    console.log(JSON.stringify(fnolPayload, null, 2));
    console.log('------------------------------------');

    incident.fnol = { status: 'Submitted', lastUpdated: new Date().toISOString() };
    addAuditLog(incident, 'FNOL Submitted', `User consented and incident data was submitted to insurer.`);
    processedActionIds.add(req.body.actionId);
    
    broadcast({ type: 'update-incident', payload: incident });
    
    // Simulate insurer's async callback
    const callbackDelay = 5000 + Math.random() * 5000; // 5-10 seconds
    setTimeout(() => {
        fetch(`http://localhost:${PORT}/api/insurer/mock-callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ incidentId: incident.id })
        }).catch(err => console.error('Mock callback failed:', err));
    }, callbackDelay);

    res.status(202).json({ message: "FNOL submitted successfully.", incident });
});

// Mock insurer callback endpoint
// FIX: Add explicit types for req and res to route handler.
app.post('/api/insurer/mock-callback', (req: ExpressRequest, res: ExpressResponse) => {
    const { incidentId } = req.body;
    const incidentIndex = incidentsData.findIndex(inc => inc.id === incidentId);

    if (incidentIndex === -1) return res.status(404).json({ message: "Incident not found for callback" });
    
    const incident = incidentsData[incidentIndex];
    const isAccepted = Math.random() > 0.3; // 70% chance of acceptance

    if (incident.fnol) {
        incident.fnol.status = isAccepted ? 'Accepted' : 'Rejected';
        incident.fnol.lastUpdated = new Date().toISOString();
        if (isAccepted) {
            incident.fnol.claimId = `CLM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        }
    } else {
        return res.status(400).json({ message: "Incident has no FNOL status to update." });
    }

    addAuditLog(
        incident,
        `FNOL ${isAccepted ? 'Accepted' : 'Rejected'}`,
        isAccepted ? `Claim approved with ID: ${incident.fnol.claimId}` : `Claim rejected due to policy exclusion.`
    );

    console.log(`Insurer callback processed for ${incidentId}. Status: ${incident.fnol.status}`);
    broadcast({ type: 'update-incident', payload: incident });
    res.status(200).json({ message: "Callback processed" });
});


// Kiosk ingestion endpoint
// FIX: Add explicit types for req and res to route handler.
app.post('/api/kiosk/sync', (req: ExpressRequest, res: ExpressResponse) => {
    const { events } = req.body;
    if (!Array.isArray(events)) {
        return res.status(400).json({ message: 'Request body must be an object with an "events" array.' });
    }

    let successCount = 0;
    const errors: string[] = [];

    events.forEach((event, index) => {
        // Basic validation
        if (!event.lat || !event.lon || !event.type || !event.timestamp) {
            errors.push(`Event at index ${index} is missing required fields (lat, lon, type, timestamp).`);
            return;
        }

        const newIncident: Incident = {
            id: `inc_${Date.now()}_${index}`,
            lat: parseFloat(event.lat),
            lon: parseFloat(event.lon),
            type: event.type,
            severity: event.severity || 'Medium',
            status: 'Reported',
            timestamp: new Date(event.timestamp).toISOString(),
            reporter_name: event.reporter_name || 'Kiosk Reporter',
            source: event.source || 'Kiosk',
            media: event.media ? [event.media] : [], // Assume single media URL
            isVerified: false,
            isFlagged: false,
            auditLog: [{
                user: 'System',
                role: 'System',
                timestamp: new Date().toISOString(),
                action: 'Incident Created',
                comment: `Incident ingested via Kiosk Sync.`
            }],
            fnol: {
                status: 'None',
                lastUpdated: new Date().toISOString(),
            }
        };

        incidentsData.unshift(newIncident);
        broadcast({ type: 'new-incident', payload: newIncident });
        successCount++;
    });

    if (incidentsData.length > 500) { // Keep data size manageable
      incidentsData = incidentsData.slice(0, 400);
    }
    
    res.status(200).json({
        message: 'Sync completed.',
        successCount,
        errorCount: errors.length,
        errors,
    });
});


// Rules API
// FIX: Add explicit types for req and res to route handler to resolve type conflicts.
app.get('/api/rules', (_req: ExpressRequest, res: ExpressResponse) => res.json(alertRules));
// FIX: Add explicit types for req and res to route handler to resolve type conflicts.
app.get('/api/templates', (_req: ExpressRequest, res: ExpressResponse) => res.json(alertTemplates));

// FIX: Add explicit types for req and res to route handler.
app.post('/api/rules', (req: ExpressRequest, res: ExpressResponse) => {
    const newRule: AlertRule = { ...req.body, id: `rule_${Date.now()}`};
    alertRules.push(newRule);
    res.status(201).json(newRule);
});

// FIX: Add explicit types for req and res to route handler.
app.put('/api/rules/:id', (req: ExpressRequest, res: ExpressResponse) => {
    const { id } = req.params;
    const updatedRule: AlertRule = req.body;
    const ruleIndex = alertRules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return res.status(404).send('Rule not found');
    alertRules[ruleIndex] = { ...alertRules[ruleIndex], ...updatedRule };
    res.json(alertRules[ruleIndex]);
});

// FIX: Add explicit types for req and res to route handler.
app.delete('/api/rules/:id', (req: ExpressRequest, res: ExpressResponse) => {
    const { id } = req.params;
    const initialLength = alertRules.length;
    alertRules = alertRules.filter(r => r.id !== id);
    if (alertRules.length === initialLength) return res.status(404).send('Rule not found');
    res.status(204).send();
});

// Logs API
// FIX: Add explicit types for req and res to route handler to resolve type conflicts.
app.get('/api/alerts/logs', (_req: ExpressRequest, res: ExpressResponse) => res.json(alertLogs));


// --- Data Retention Purge Job ---
const RETENTION_PERIOD_DAYS = 90;
const PURGE_JOB_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes

const runDataRetentionPurge = () => {
    console.log('Running data retention purge job...');
    const now = new Date();
    const retentionCutoff = new Date(now.getTime() - (RETENTION_PERIOD_DAYS * 24 * 60 * 60 * 1000));
    
    incidentsData.forEach(incident => {
        if (incident.isAnonymized) return;

        const incidentDate = new Date(incident.timestamp);
        const isOld = incidentDate < retentionCutoff;
        const isInactive = incident.status === 'Resolved' || incident.status === 'Closed';

        if (isOld && isInactive) {
            console.log(`Anonymizing incident ${incident.id} due to retention policy.`);
            
            // Anonymize data
            incident.isAnonymized = true;
            incident.lat = parseFloat(incident.lat.toFixed(2)); // Coarse location
            incident.lon = parseFloat(incident.lon.toFixed(2));
            incident.reporter_name = '[Purged]';

            if (incident.breadcrumb) {
                incident.breadcrumb = incident.breadcrumb.map(b => ({
                    ...b,
                    lat: parseFloat(b.lat.toFixed(2)),
                    lon: parseFloat(b.lon.toFixed(2)),
                }));
            }
            
            addAuditLog(incident, 'Data Purged', 'Incident anonymized by automated retention policy.');
            
            // Notify clients of the update
            broadcast({ type: 'update-incident', payload: incident });
        }
    });
};


// --- Streaming Logic ---
const startStreaming = () => {
  // Incident streaming
  setInterval(() => {
    if (incidentsData.length === 0) return;
    const template = incidentsData[Math.floor(Math.random() * incidentsData.length)];
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const newIncident: Incident = {
      ...template,
      id: `inc_${Date.now()}_${randomSuffix}`,
      timestamp: new Date().toISOString(),
      status: 'Reported',
      isVerified: false,
      isFlagged: false,
      claimedBy: undefined,
      isAnonymized: false,
      lat: template.lat + (Math.random() - 0.5) * 0.02,
      lon: template.lon + (Math.random() - 0.5) * 0.02,
      notes: [], media: [], breadcrumb: [],
      auditLog: [{
          user: 'System',
          role: 'System',
          timestamp: new Date().toISOString(),
          action: 'Incident Created',
          comment: `Incident automatically generated.`
      }],
      fnol: {
          status: 'None',
          lastUpdated: new Date().toISOString(),
      }
    };
    
    incidentsData.unshift(newIncident);
    if (incidentsData.length > 200) incidentsData.pop();

    console.log(`Broadcasting new incident: ${newIncident.id}`);
    broadcast({ type: 'new-incident', payload: newIncident });
    // evaluateRules(newIncident); // Only evaluate rules for verified incidents

  }, 10000 + Math.random() * 10000); // 10-20 seconds

  // Social Post streaming
  setInterval(() => {
    if (socialPostsData.length === 0) return;
    const postTemplate = { ...socialPostsData[Math.floor(Math.random() * socialPostsData.length)] };
    postTemplate.id = `soc_${Date.now()}`;
    postTemplate.timestamp = new Date().toISOString();
    const classifiedPost = classifyPost(postTemplate);
    broadcast({ type: 'new-social-post', payload: classifiedPost });
  }, 7000 + Math.random() * 8000); // 7-15 seconds
  
  // Start retention job
  setInterval(runDataRetentionPurge, PURGE_JOB_INTERVAL_MS);
  runDataRetentionPurge(); // Run once on startup

  // Heartbeat
  setInterval(() => broadcast({ type: 'heartbeat' }), 30000);
};

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', error => console.error('WebSocket error:', error));
});

// SPA Fallback
// FIX: Add explicit types for req and res to route handler.
app.get('*', (_req: ExpressRequest, res: ExpressResponse) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is running on ${isProduction ? 'https' : 'http'}://localhost:${PORT}`);
  startStreaming();
});