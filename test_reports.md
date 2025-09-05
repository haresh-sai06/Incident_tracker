
# Test Reports

This document summarizes the automated tests implemented for the Incident Response Dashboard.

## 1. Unit Tests (Vitest)

Unit tests are focused on verifying small, isolated pieces of logic within the application. We use the [Vitest](https://vitest.dev/) framework for this.

### Social Media NLP Classifier (`utils/nlp.test.ts`)

-   **Purpose**: To ensure the simple NLP classifier correctly categorizes social media posts as "hazard" or "noise" and extracts relevant keywords.
-   **Coverage**:
    -   Tests posts with clear "hazard" keywords (e.g., "fire", "crash").
    -   Tests posts with clear "noise" keywords (e.g., "concert", "music").
    -   Tests posts with a mix of keywords to verify the scoring logic.
    -   Verifies that the top keywords are correctly identified and returned.
-   **To Run**: `npm test`
-   **Expected Output**:

```
✓ utils/nlp.test.ts (4)
  ✓ classifyPost
    ✓ should classify a post with strong hazard keywords as 'hazard'
    ✓ should classify a post with noise keywords as 'noise'
    ✓ should classify a post with weak hazard keywords as 'noise'
    ✓ should correctly extract and rank the top keywords

Test Files  1 passed (1)
     Tests  4 passed (4)
  Start at  10:30:00
  Duration  15ms (transform 2ms, setup 0ms, collect 3ms, tests 1ms)
```

## 2. End-to-End Tests (Cypress)

E2E tests simulate real user workflows from start to finish. We use the [Cypress](https://www.cypress.io/) framework for this.

### Offline Kiosk Submission (`cypress/e2e/offline_sos.cy.ts`)

-   **Purpose**: To verify the critical "offline SOS" workflow. This test ensures that an incident reported from a kiosk while it is offline is successfully queued and synchronized with the server once the connection is restored.
-   **Test Flow**:
    1.  Visits the Kiosk uploader page (`/kiosk.html`).
    2.  Creates a mock incident report as a CSV file in memory.
    3.  Simulates a file upload with the mock data.
    4.  Simulates an offline network condition by intercepting the API call and forcing a network error.
    5.  Attempts to upload the incident, which fails and triggers the offline outbox logic.
    6.  Simulates coming back online by removing the network error intercept.
    7.  Navigates to the Moderation page, which helps trigger the online sync process.
    8.  Waits for the sync API call to be successfully retried.
    9.  Verifies that the new incident from the kiosk now appears in the Moderation Queue.
-   **To Run**: `npm run cypress:open` and then select the `offline_sos.cy.ts` test to run.
-   **Expected Output**: A successful Cypress test run showing all steps passing.

```
✓ Offline SOS and Sync Flow (15.25s)
  ✓ should allow a kiosk to submit an incident offline and sync it when online (15.25s)

1 passing (16s)
```
