
# Deployment Guide

This guide provides instructions for deploying the frontend and backend of the Incident Response Dashboard.

## Frontend (Vercel / Netlify)

The frontend is a standard Vite-based React application and can be easily deployed to any static hosting provider like Vercel or Netlify.

### General Steps:

1.  **Connect Your Git Repository**: Push the project code to a GitHub, GitLab, or Bitbucket repository.
2.  **Create a New Project**: In your Vercel or Netlify dashboard, create a new project and import the repository.
3.  **Configure Build Settings**: The platform should automatically detect that it's a Vite project. If not, use the following settings:
    *   **Build Command**: `npm run build` or `vite build`
    *   **Output Directory**: `dist`
    *   **Install Command**: `npm install`
4.  **Environment Variables**: No environment variables are required for the frontend build.
5.  **Deploy**: Trigger the deployment. The provider will build the application and deploy it to their global CDN.

After deployment, you will get a public URL for your dashboard. You will need to configure this URL in the backend's CORS settings if you are hosting the backend separately.

## Backend (Docker)

The backend is a Node.js Express server that can be deployed as a Docker container. A `Dockerfile` is provided in the root of the project.

### Prerequisites:

*   Docker installed on your deployment server.

### Building the Docker Image:

1.  Navigate to the project's root directory in your terminal.
2.  Run the build command:
    ```bash
    docker build -t incident-rm-server .
    ```
    This command will build the frontend, install backend dependencies, and create a production-ready Docker image named `incident-rm-server`.

### Running the Docker Container:

1.  Once the image is built, you can run it as a container:
    ```bash
    docker run -d -p 4000:4000 --name incident-rm-container incident-rm-server
    ```
    *   `-d`: Runs the container in detached mode (in the background).
    *   `-p 4000:4000`: Maps port 4000 on the host machine to port 4000 inside the container.
    *   `--name incident-rm-container`: Assigns a name to the container for easy management.
    *   `incident-rm-server`: The name of the image to use.

2.  The backend server will now be running and accessible on `http://<your-server-ip>:4000`. The WebSocket server will be on `ws://<your-server-ip>:4000`.

### Managing the Container:

*   **View logs**: `docker logs incident-rm-container`
*   **Stop**: `docker stop incident-rm-container`
*   **Start**: `docker start incident-rm-container`
*   **Remove**: `docker rm incident-rm-container`
