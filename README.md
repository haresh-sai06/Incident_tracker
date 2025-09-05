<<<<<<< HEAD
# Tourist Safety Ops Dashboard

A modern, responsive dashboard for real-time incident tracking and management. Built with React, Vite, TypeScript, and Tailwind CSS.

## Features

-   **Dashboard Overview:** At-a-glance view of key metrics and KPIs for tourist safety operations.
-   **Interactive Map:** Live map with color-coded, clustered markers for all incidents.
-   **Advanced Filtering:** Real-time filtering of incidents by date range, type, and severity.
-   **Sortable Incident Table:** A paginated table displaying detailed incident information, sortable by time and severity.
-   **Incident Detail Drawer:** A comprehensive slide-in panel for viewing incident details, media, and taking action.
-   **Real-time Streaming:** Connects to a live WebSocket feed to receive and display new incidents as they happen, with UI highlights.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or a compatible package manager

### Installation

1.  Clone the repository and navigate into the project directory.

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development environment, run the following command. This will start both the Vite frontend server (`http://localhost:5173`) and the WebSocket server (`ws://localhost:4000`) concurrently.

```bash
npm run dev
```

The application will automatically open in your browser and navigate to the dashboard. New incidents will begin streaming in automatically.

### Data

The dashboard is pre-configured to use sample data from `/sample_data/incidents.json`. The WebSocket server also uses this file to generate new, random incidents for the real-time stream.
=======
# Incident_tracker
to be added 
>>>>>>> be16179022d86999bd8946b7d25f63b4ab031965
