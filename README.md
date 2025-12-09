## Overview

The Rideau Canal Monitoring Dashboard is a real-time web application that visualizes environmental and safety conditions across the Rideau Canal Skateway. It consumes processed data from Azure Cosmos DB and displays:

Latest sensor measurements

Safety status indicators per location

Real-time system status

Historical trend charts for ice thickness and temperature

The dashboard is built using Node.js + Express for the backend API and HTML/CSS/JavaScript + Chart.js for the frontend UI.

### Technologies Used

Backend

- Node.js

- Express.js

- @azure/cosmos SDK

- dotenv

- CORS

Frontend

- HTML5 / CSS3

- Vanilla JavaScript

- Chart.js

- Fetch API

Azure Services

- Azure Cosmos DB

- Azure App Service

- Azure Stream Analytics (provides aggregated data)

- Azure IoT Hub (upstream data source)

## Prerequisites

You will need:

Node.js v16+

Azure Cosmos DB account

A deployed Stream Analytics job writing into Cosmos DB

.env file configured with your credentials

Internet access

## Installation

Clone the repository:

git clone https://github.com/resh2024/rideau-canal_dashboard
cd rideau-canal-dashboard

Install dependencies:

npm install

## Configuration

Create a .env file in the project root:

COSMOS_ENDPOINT="your-cosmos-endpoint"
COSMOS_KEY="your-cosmos-key"
COSMOS_DATABASE="RideauCanalDB"
COSMOS_CONTAINER="SensorAggregations"
PORT=5000

A .env.example file is included.

🚀 Running Locally

Start the server:

node server.js

Visit the dashboard:

http://localhost:5000

## API Endpoints

1. Get Latest Readings

Returns latest aggregated readings for all 3 locations.

GET /api/latest

Response Example:

{
"success": true,
"timestamp": "2025-12-07T14:20:21Z",
"data": [
{
"location": "Dows_Lake",
"avgIceThickness": 32.1,
"avgSurfaceTemp": -6.5,
"maxSnowAccumulation": 3.2,
"safetyStatus": "Safe",
"windowEnd": "2025-12-07T14:15:00Z"
}
]
}

2. Get Historical Trend Data

Returns the last 1-hour of 5-minute aggregates.

GET /api/history/:location?limit=12

Example Request:

GET /api/history/Dows_Lake?limit=12

Response Example:

{
"success": true,
"location": "Dows_Lake",
"data": [
{
"windowEnd": "2025-12-07T14:10:00Z",
"avgIceThickness": 31.2,
"avgSurfaceTemp": -7.0
}
]
}

3. System-wide Safety Status
   GET /api/status

Response Example:

{
"success": true,
"overallStatus": "Caution",
"locations": [
{
"location": "NAC",
"safetyStatus": "Unsafe",
"windowEnd": "2025-12-07T14:15:00Z"
}
]
}

4. Debug – Get All Records
   GET /api/all

## Deployment to Azure App Service

Create App Service

In Azure Portal:

Create → Web App

Runtime stack: Node 18 LTS

Publish: Code

Region: (Match your Cosmos region)

Configure Environment Variables

In App Service → Configuration → Application Settings:

Key Value
COSMOS_ENDPOINT your endpoint
COSMOS_KEY your key
COSMOS_DATABASE RideauCanalDB
COSMOS_CONTAINER SensorAggregations
PORT 8080 3. Deploy Code

You can deploy via:

Option A: ZIP Deploy
zip -r app.zip .
az webapp deploy --resource-group <rg> --name <appname> --src-path app.zip

Option B: GitHub Actions (Recommended)

Enable CI/CD under Deployment Center.

Update Startup Command (optional)

In App Service → Configuration:

node server.js

Browse Your Live Dashboard
https://thankful-wave-037ed240f.3.azurestaticapps.net

Dashboard Features
Real-Time Updates

Latest canal readings update every 30 seconds

Interactive Visualizations

- Ice Thickness Trend

- Temperature Trend

- Multi-location overlays

Safety Status Indicators

- Safe

- Caution

- Unsafe

Color-coded, automatically computed from processed data.

## Troubleshooting

### Dashboard shows “--” or “NaN”

Check:

- Stream Analytics query produces aggregates

- Fields are correctly named:

- avgIceThickness

- avgSurfaceTemp

- maxSnowAccumulation

No data in charts

- Ensure 12+ records exist per location

- ASA window size must be 5 minutes

- Simulator must be running at least ~1 hour for trend lines

500 Internal Server Error

Check:

- Invalid Cosmos DB keys

- Wrong database/container name

- Firewall restrictions on Cosmos DB

App Service shows “Application Error”

- Set your startup command:

- node server.js
