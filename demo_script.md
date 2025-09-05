
# 7-Minute Incident Response Dashboard Demo

**Objective**: Showcase the dashboard's capabilities as a real-time, resilient, and comprehensive operational tool.

**Presenter**: [Your Name]

---

### **Part 1: Introduction & Dashboard Overview (0:00 - 1:30)**

**(0:00) - Speaker Notes:**
"Good morning. Today I'm excited to present our Incident Response Dashboard, a comprehensive platform designed for real-time operational awareness and management. What you're seeing is the main dashboard, the central hub for our operators."

**Manual Steps:**
1.  Have the application open on the `/dashboard` page.
2.  Let the live data stream for a few seconds.

**(0:20) - Speaker Notes:**
"At the top, we have our key performance indicators or KPIs. These give us an instant snapshot of our current situation: the number of active incidents, how many reports have been verified by our team today, and even how many insurance claims have been filed directly from the platform. These are updated in real-time."

**Manual Steps:**
1.  Gesture towards the KPI cards at the top of the screen.

**(0:45) - Speaker Notes:**
"The dashboard is built around two core components: an interactive map and a detailed incident table. The map provides immediate geographical context, clustering incidents in dense areas to keep the view clean. As we zoom in, the clusters break apart, revealing individual incidents color-coded by severity—from low-severity green to critical red."

**Manual Steps:**
1.  Hover over a marker cluster on the map.
2.  Zoom into a dense area to show the clusters de-clustering.
3.  Hover over an individual marker to show its popup.

**(1:10) - Speaker Notes:**
"Complementing the map is our incident table, which provides detailed, sortable information. Operators can quickly sort by time or severity to prioritize their focus. The entire interface is connected; selecting an incident on the map highlights it in the table and vice versa, and opens a detailed drawer with all known information."

**Manual Steps:**
1.  Click the "Severity" header on the table to sort.
2.  Click an incident on the map, showing it highlight in the table and the detail drawer opening.
3.  Close the drawer.

---

### **Part 2: Real-time Feeds & Proactive Alerting (1:30 - 3:00)**

**(1:30) - Speaker Notes:**
"This is more than just a static display; it's a living platform. In the top right, our Live Feed shows new, unverified reports as they come in. This is our first line of sight."

**Manual Steps:**
1.  A new incident should appear in the feed. Click the bell icon to open the Live Feed dropdown.
2.  Click on a new incident in the feed to demonstrate the map focusing on it.

**(2:00) - Speaker Notes:**
"We also ingest data from other sources. The Activity Panel on the right includes a real-time Social Media Feed. Our backend uses a simple NLP model to automatically classify posts as potential hazards or noise, extracting keywords to help operators quickly identify relevant events. A post flagged as a hazard can be promoted to an incident with a single click."

**Manual Steps:**
1.  Switch to the "Social Feed" tab in the Activity Panel.
2.  Point out a post classified as a "Hazard" with its keywords.
3.  Gesture to the "Promote to Incident" button.

**(2:30) - Speaker Notes:**
"To make our response even more proactive, we have a built-in Alerts & Escalation system. Operators can create rules—for example, 'alert me if three high-severity incidents occur within 500 meters in 10 minutes.' When a rule is triggered, the system automatically dispatches notifications via email or SMS and logs the action, ensuring accountability."

**Manual Steps:**
1.  Switch to the "Alerts" tab.
2.  Show the list of triggered alert logs.
3.  Click on "Rules" to show the configured alert rules.

---

### **Part 3: Moderation & Workflow (3:00 - 4:30)**

**(3:00) - Speaker Notes:**
"To ensure data quality, every new report first enters our Moderation Queue. Let's go there now."

**Manual Steps:**
1.  Click "Moderation" in the sidebar.

**(3:15) - Speaker Notes:**
"Here, moderators can review unverified reports. The cards provide all the key details. To prevent duplicate work, a moderator can 'Claim' an incident. Let's claim this one. Now, other operators see that it's being handled."

**Manual Steps:**
1.  Find an unclaimed incident card and click the "Claim" button. Show that it's now marked as claimed by you.

**(3:45) - Speaker Notes:**
"The system supports different user roles. I'm currently logged in as an Operator. Let me switch to our 'Partner Agency' user. Notice how the claimed incident is now greyed out, indicating it's locked. Once reviewed, an incident can be verified, which formally adds it to the main operational dashboard for dispatch."

**Manual Steps:**
1.  Use the User Switcher in the header to select the "Partner Agency A" user.
2.  Point out the previously claimed incident is now disabled.
3.  Switch back to the "Jane Doe (Operator)" user.
4.  Find your claimed incident and click "Verify". The card disappears from the queue.

**(4:15) - Speaker Notes:**
"Every action is recorded in a permanent audit log, providing full accountability."

**Manual Steps:**
1.  Navigate back to the main dashboard. Find the just-verified incident.
2.  Open its detail drawer and scroll to the "Audit Log" to show the "Claim" and "Verify" actions.

---

### **Part 4: Integrations, Offline Resilience & Privacy (4:30 - 6:30)**

**(4:30) - Speaker Notes:**
"Our platform also integrates with external partners. For certain incidents, we can file a First Notice of Loss directly with an insurer. Clicking 'Create FNOL' brings up a consent form. Once confirmed, the payload is sent, and we get real-time status updates back from the insurer, including the final Claim ID."

**Manual Steps:**
1.  In the detail drawer of a relevant incident (e.g., Theft), click "Create FNOL".
2.  Check the consent box and click "Proceed".
3.  Show the FNOL status updating in the drawer.

**(5:15) - Speaker Notes:**
"The system is built to be resilient. If the network connection is lost, all actions are securely saved in an 'outbox' in the browser. When the connection is restored, the outbox automatically syncs with the server. We also have a kiosk mode for bulk ingestion."

**Manual Steps:**
1.  Open Chrome DevTools -> Application -> Service Workers.
2.  Check the "Offline" box.
3.  Go to an incident and add a note. The request will fail.
4.  Uncheck the "Offline" box.
5.  Show the note appearing in the incident details after a few seconds as the outbox syncs.

**(6:00) - Speaker Notes:**
"Finally, we take privacy very seriously. We have a Privacy Center where users can request data deletion. An automated retention job also runs on the server, which anonymizes old, inactive incidents by coarsening their location data to protect privacy while preserving analytical value. You can see these anonymized incidents on the map, marked with a faded icon."

**Manual Steps:**
1.  Click "Privacy Center" in the sidebar.
2.  Show the user's view and the admin's view of deletion requests.
3.  Go back to the dashboard and point out an anonymized incident on the map (faded marker).

---

### **Part 5: Conclusion (6:30 - 7:00)**

**(6:30) - Speaker Notes:**
"In summary, the Incident Response Dashboard is a powerful, resilient, and secure platform that provides end-to-end capabilities for modern operations—from real-time ingestion and moderation to automated alerting and privacy compliance. Thank you."

**Manual Steps:**
1.  Return to the main dashboard view.
2.  Field questions.
