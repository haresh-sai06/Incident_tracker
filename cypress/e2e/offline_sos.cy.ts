
describe('Offline SOS and Sync Flow', () => {
  it('should allow a kiosk to submit an incident offline and sync it when online', () => {
    // Step 1: Visit the kiosk page
    cy.visit('/kiosk.html');
    cy.contains('Kiosk Sync').should('be.visible');

    // Step 2: Prepare the test data and simulate file upload
    const incidentId = `SOS-${Date.now()}`;
    const csvContent = `lat,lon,type,timestamp,reporter_name\n37.7,-122.4,${incidentId},${new Date().toISOString()},Offline Kiosk`;
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(csvContent),
      fileName: 'sos.csv',
      mimeType: 'text/csv',
    });
    cy.get('#status').should('contain.text', 'Parsed 1 events');

    // Step 3: Intercept the API call to simulate being offline
    cy.intercept('POST', '/api/kiosk/sync', { forceNetworkError: true }).as('syncCall');
    
    // Step 4: Click upload, which should fail and trigger offline queuing
    cy.get('#uploadButton').click();
    cy.get('#status').should('contain.text', 'Uploading...');
    
    // Note: The kiosk page doesn't show the offline queue status, which is fine.
    // The underlying API client will queue the request. We verify the result later.

    // Step 5: "Come back online" by removing the intercept
    // We create a new intercept to catch the successful retry
    cy.intercept('POST', '/api/kiosk/sync').as('successfulSyncCall');
    
    // Step 6: Trigger the online event to start the sync process
    // The service worker and offline handler should pick this up.
    // Forcing a page load is a reliable way to trigger this in a test.
    cy.visit('/moderation');
    
    // Step 7: Wait for the sync to complete and verify the new incident
    cy.wait('@successfulSyncCall').its('response.statusCode').should('eq', 200);

    // Step 8: Check the moderation page for the synced incident
    cy.visit('/moderation');
    cy.contains(incidentId, { timeout: 10000 }).should('be.visible');
    cy.contains('Offline Kiosk').should('be.visible');
  });
});