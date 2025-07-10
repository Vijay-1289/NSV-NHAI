

## Pavement Condition Monitoring Backend Setup

1. Clone the Road-Condition-Monitoring repo:
   git clone https://github.com/Amsterdam-Internships/Road-Condition-Monitoring.git

2. Follow the instructions in the repo to set up the Python environment and install dependencies (typically using requirements.txt).

3. (Recommended) Set up a Flask or FastAPI server that exposes an endpoint for pavement condition prediction. The endpoint should accept image URLs or files and return the model's prediction.

4. Run the backend server locally (e.g., on http://localhost:5000).

5. The frontend will call this backend to get pavement condition data for highway segments.

6. (Optional) Integrate Google Street View API in the backend to fetch images for given coordinates.

Refer to the Road-Condition-Monitoring repo for model details and usage: https://github.com/Amsterdam-Internships/Road-Condition-Monitoring.git
