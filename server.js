/**
 * Rideau Canal Monitoring Dashboard - Backend Server (FIXED FOR ASA SCHEMA)
 */

const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cosmos DB Client
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

// ---------------------------------------------------------------------------
// GET LATEST DATA
// ---------------------------------------------------------------------------
app.get('/api/latest', async (req, res) => {
    try {
        const locations = ["Dows_Lake", "Fifth_Avenue", "NAC"];
        const results = [];

        for (const location of locations) {
            const querySpec = {
                query: "SELECT * FROM c WHERE c.location = @location",
                parameters: [{ name: "@location", value: location }]
            };

            const { resources } = await container.items.query(querySpec).fetchAll();

            if (resources.length > 0) {
                resources.sort((a, b) =>
                    new Date(b.windowEnd) - new Date(a.windowEnd)
                );
                results.push(resources[0]);
            }
        }

        res.json({ success: true, data: results });

    } catch (error) {
        console.error("Error fetching latest:", error);
        res.status(500).json({ success: false, error: "Failed to fetch latest" });
    }
});

// ---------------------------------------------------------------------------
// GET HISTORICAL DATA
// ---------------------------------------------------------------------------
app.get('/api/history/:location', async (req, res) => {
    try {
        const { location } = req.params;

        const querySpec = {
            query: "SELECT * FROM c WHERE c.location = @location",
            parameters: [{ name: "@location", value: location }]
        };

        const { resources } = await container.items.query(querySpec).fetchAll();

        resources.sort((a, b) =>
            new Date(b.windowEnd) - new Date(a.windowEnd)
        );

        res.json({
            success: true,
            location: location,
            data: resources.reverse()
        });

    } catch (error) {
        console.error("History error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
});

// ---------------------------------------------------------------------------
// SYSTEM STATUS
// ---------------------------------------------------------------------------
app.get('/api/status', async (req, res) => {
    try {
        const locations = ["Dows_Lake", "Fifth_Avenue", "NAC"];
        const statuses = [];

        for (const location of locations) {
            const querySpec = {
                query: "SELECT c.location, c.safetyStatus, c.windowEnd FROM c WHERE c.location = @location",
                parameters: [{ name: "@location", value: location }]
            };

            const { resources } = await container.items.query(querySpec).fetchAll();

            if (resources.length > 0) {
                resources.sort((a, b) =>
                    new Date(b.windowEnd) - new Date(a.windowEnd)
                );
                statuses.push(resources[0]);
            }
        }

        const overallStatus = statuses.every(s => s.safetyStatus === "Safe")
            ? "Safe"
            : statuses.some(s => s.safetyStatus === "Unsafe")
                ? "Unsafe"
                : "Caution";

        res.json({ success: true, overallStatus, locations: statuses });

    } catch (error) {
        console.error("Status error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch status" });
    }
});

// Debug endpoint
app.get('/api/all', async (req, res) => {
    try {
        const { resources } = await container.items.query("SELECT * FROM c").fetchAll();

        resources.sort((a, b) =>
            new Date(b.windowEnd) - new Date(a.windowEnd)
        );

        res.json({
            success: true,
            count: resources.length,
            data: resources
        });

    } catch (error) {
        console.error("All error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch all data" });
    }
});

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        cosmosdb: {
            endpoint: process.env.COSMOS_ENDPOINT ? "configured" : "missing",
            database: process.env.COSMOS_DATABASE,
            container: process.env.COSMOS_CONTAINER
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Dashboard backend running at http://localhost:${port}`);
});
