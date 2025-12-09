# API Endpoints Documentation

This table summarizes the key REST API endpoints used by the Rideau Canal Ice Monitoring Dashboard backend.

| Method | Endpoint         | Description                                      | Request Example                 | Response Example (simplified)                            |
| ------ | ---------------- | ------------------------------------------------ | ------------------------------- | -------------------------------------------------------- |
| GET    | `/api/locations` | Retrieves list of all monitored locations.       | `GET /api/locations`            | `["Dows_Lake", "Fifth_Avenue", "NAC"]`                   |
| GET    | `/api/latest`    | Fetches the latest readings for each location.   | `GET /api/latest`               | `{ "location": "NAC", "iceThickness": 28.4, ... }`       |
| GET    | `/api/history`   | Retrieves historical readings from Blob Storage. | `GET /api/history?location=NAC` | `[{ "timestamp": "...", "ice_thickness_cm": ... }, ...]` |
| GET    | `/api/trends`    | Computes trend data over time (5-min windows).   | `GET /api/trends?location=NAC`  | `{ "avgIceThickness": 26.5, "readingCount": 15, ... }`   |
| GET    | `/api/safety`    | Retrieves the latest safety status per location. | `GET /api/safety`               | `{ "location": "NAC", "safetyStatus": "Unsafe" }`        |

## Notes

- You can use query parameters like `?location=<Location>` for endpoints like `/api/history` and `/api/trends`.
- Trend data is pre-aggregated every 5 minutes by Azure Stream Analytics.
- Data is retrieved from Cosmos DB (`/api/latest`, `/api/safety`) and from Azure Blob Storage (`/api/history`).
