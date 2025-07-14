# NSV-NHAI: Smart Highway Monitoring Platform

A web application for intelligent highway monitoring and management, enabling users, inspectors, and engineers to collaborate on road safety and maintenance using geospatial data, real-time notifications, and role-based dashboards.

## Features
- **Role-Based Dashboards**: User, Inspector, and Engineer dashboards with tailored functionality.
- **Interactive Map**: Visualize highways, report issues, and plan routes using Leaflet and Google Maps APIs.
- **Issue Reporting & Management**: Report, inspect, and resolve highway issues with location, severity, and images.
- **Authentication & Authorization**: Secure login and role management via Supabase.
- **Real-Time Updates**: Notifications and live updates for new and resolved issues.
- **Media Background**: Customizable background (Earth.jpg or Earth.mp4) for a modern UI experience.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Leaflet, Google Maps JavaScript API
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Other Integrations**: Google Maps API, Supabase Realtime

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Supabase project (for database, auth, and storage)

### Frontend Setup
1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd NSV-NHAI
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Add your Supabase credentials and Google Maps API key to your environment/config files as needed.
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) to view the app.

### Backend (Pavement Condition Monitoring) Setup

1. Clone the Road-Condition-Monitoring repo:
   ```bash
   git clone https://github.com/Amsterdam-Internships/Road-Condition-Monitoring.git
   ```
2. Follow the instructions in the repo to set up the Python environment and install dependencies (typically using requirements.txt).
3. (Recommended) Set up a Flask or FastAPI server that exposes an endpoint for pavement condition prediction. The endpoint should accept image URLs or files and return the model's prediction.
4. Run the backend server locally (e.g., on http://localhost:5000).
5. The frontend will call this backend to get pavement condition data for highway segments.
6. (Optional) Integrate Google Street View API in the backend to fetch images for given coordinates.

Refer to the Road-Condition-Monitoring repo for model details and usage: https://github.com/Amsterdam-Internships/Road-Condition-Monitoring.git

## Customization
- To change the background, replace `Earth.jpg` (or use `Earth.mp4` for video background) in the project root.
- Update API keys and environment variables as needed for your deployment.

## License
This project is for demonstration and educational purposes. See individual files for license details.
