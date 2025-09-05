
# Example API Payloads

## 1. FNOL Submission Payload

This is an example of the payload sent from the dashboard server to the mock insurer endpoint (`POST /api/insurer/fnol`). It bundles all relevant incident data into a structured format for the insurer.

```json
{
  "policyHolder": "Alice Johnson",
  "incidentReference": "inc_001",
  "incidentTime": "2024-05-21T10:30:00Z",
  "location": {
    "lat": 37.7749,
    "lon": -122.4194
  },
  "description": "Incident of type 'Theft'. Notes: Initial report confirmed by patrol.",
  "mediaUrls": [
    "https://picsum.photos/400/300?random=1"
  ]
}
```

## 2. Mock Insurer Callback Payload

This is the internal payload used by the server to trigger the simulated insurer response. The server calls itself with this payload after a delay to mimic an asynchronous callback.

**File:** `server/server.ts` (internal `fetch` call)
**Endpoint:** `POST /api/insurer/mock-callback`

```json
{
  "incidentId": "inc_001"
}
```

The callback endpoint then processes this, updates the incident's FNOL status to either `Accepted` or `Rejected`, generates a Claim ID if accepted, and broadcasts the update to all clients.
