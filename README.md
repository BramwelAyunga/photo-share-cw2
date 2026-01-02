# PhotoShare - Full-Stack Web Application

This project is a full-stack photo-sharing web application built with Node.js, Express, MySQL, React, and Azure Blob Storage.

## Features

-   **Authentication:** JWT-based authentication with email/password.
-   **Media Management:** Upload, edit, and delete images for creators.
-   **Image Processing:** Automated thumbnail generation and image optimization.
-   **Community Features:** Rate media, post comments 
-   **Search & Discovery:** Public gallery with search and filtering.
-   **User Profiles:** View user-specific content.

## Tech Stack

-   **Backend:** Node.js, Express.js
-   **Frontend:** React.js (Vite)
-   **Database:** MySQL
-   **Blob Storage:** Azure Blob Storage (Azurite for local development)
-   **Background Jobs:** BullMQ with Redis
-   **Styling:** Tailwind CSS

---

## Local Development Setup

### Prerequisites

-   [Docker](https://www.docker.com/get-started) and Docker Compose
-   [Node.js](https://nodejs.org/) (v18 or later)
-   A code editor (e.g., VS Code)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd photo-share
```

### 2. Configure Environment Variables

**Backend:**

Create a `.env` file in the `api/` directory by copying the example:

```bash
cp api/.env.example api/.env
```

Review the variables in `api/.env`. The default values are configured to work with the `docker-compose.yml` file.

**Frontend:**

The frontend does not require any specific environment variables to run locally, as the Vite proxy handles API requests.

### 3. Start Services with Docker Compose

This command will start the MySQL database, Redis for queues, and Azurite for local blob storage.

```bash
docker compose up --build -d
```

### 4. Setup Database Schema

Wait for the MySQL container to be fully running. You can check the logs with `docker-compose logs -f mysql`.

Once it's ready, execute the `schema.sql` script to create the necessary tables.

```bash
cat schema.sql | docker-compose exec -T mysql mysql -u root -p'password' photo_share
```

### 5. Install Dependencies & Run Backend

**Install API dependencies:**

```bash
cd api
npm install
cd ..
```

**Run the API server:**

This will start the main Express server.

```bash
npm run start --prefix api
```

**Run the Thumbnail Worker:**

In a separate terminal, start the worker process to handle background jobs.

```bash
npm run worker --prefix api
```

### 6. Install Dependencies & Run Frontend

**Install Client dependencies:**

```bash
cd client
npm install
cd ..
```

**Run the Client development server:**

```bash
npm run dev --prefix client
```

### 7. Access the Application

-   **Frontend:** Open your browser and navigate to [http://localhost:5173](http://localhost:5173)
-   **Backend API:** The API is running on [http://localhost:3001](http://localhost:3001)
-   **Azurite Blob Storage:** The blob storage emulator is available at `http://localhost:10000`.

---

## Production Deployment (Conceptual)

### Prerequisites

-   An Azure account with an active subscription.
-   Azure CLI installed and configured.

### Deployment Steps

1.  **Provision Azure Resources:**
    -   **Azure App Service:** Two instances (one for the frontend, one for the backend API).
    -   **Azure SQL Database:** A managed MySQL or SQL Database instance.
    -   **Azure Blob Storage:** A storage account for media files.
    -   **Azure Cache for Redis:** For the BullMQ job queue.

2.  **Configure Backend (`api`):**
    -   Update the `.env` file with production credentials for the Azure SQL Database, Azure Blob Storage, and Redis.
    -   Set `NODE_ENV=production`.
    -   The App Service will run the `npm run start` command. The worker process (`npm run worker`) needs to be run in a separate process, which can be achieved using a WebJob or another App Service plan.

3.  **Configure Frontend (`client`):**
    -   Build the static assets: `npm run build --prefix client`.
    -   Configure the App Service to serve static files from the `client/dist` folder.
    -   Set up URL rewrite rules to handle client-side routing, redirecting all non-asset requests to `index.html`.
    -   Configure CORS on the backend App Service to allow requests from the frontend's domain.

4.  **CI/CD:**
    -   Use GitHub Actions or Azure DevOps to create a pipeline that automates the build and deployment process for both the `api` and `client` applications to their respective App Services.

