# Hotel Offer Orchestrator

An Express and TypeScript service that combines hotel offers from two suppliers. When the same hotel is returned by both suppliers, the offer with the lowest price is kept. Results are cached in Redis for one hour.

## Requirements

- Node.js 18 or later
- npm
- Docker Desktop with Docker Compose (recommended for running the complete stack)

## Setup

Install the project dependencies:

```bash
npm install
```

Check the TypeScript source without starting the server:

```bash
npx tsc --noEmit
```

## Run With Docker Compose

Docker Compose starts both the API and its Redis dependency. From the project root, run:

```bash
docker compose up --build
```

The API is available at `http://localhost:3000`. To run it in the background:

```bash
docker compose up --build -d
```

Stop the services with:

```bash
docker compose down
```

The application connects to Redis using the Compose service name `redis`, so Compose is the recommended way to run the full application locally.

## Run the Development Server

The development script uses Nodemon and restarts the TypeScript server when source files change:

```bash
npm run dev
```

The application expects Redis to be reachable at host `redis` on port `6379`. Use Docker Compose unless a Redis instance is available under that hostname.

## API Endpoints

### Get hotels

```http
GET /api/hotels?city=delhi
```

Optional price filters can be supplied:

```http
GET /api/hotels?city=delhi&minPrice=5500&maxPrice=7000
```

The `city` query parameter is required. Requests without it return HTTP 400. Unknown cities return an empty array.

Example response:

```json
[
  {
    "hotelId": "b1",
    "name": "Holtin",
    "price": 5340,
    "city": "delhi",
    "commissionPct": 20,
    "supplier": "Supplier B"
  }
]
```

### Health check

```http
GET /health
```

Returns the API and Redis connection status.

### Supplier data

```http
GET /supplierA/hotels
GET /supplierB/hotels
```

These endpoints return the current mock supplier data.

## Postman

Import [postman_collection.json](postman_collection.json) into Postman to run the included requests for the merged results, price filtering, empty results, supplier data, and health check.

## Project Structure

```text
src/
	hotel_orchestrator.ts  Merge and lowest-price selection logic
	index.ts               Express server and API routes
	types.ts               Shared hotel type
	suppliers/             Mock supplier data
Dockerfile               Container image definition
docker-compose.yml       API and Redis services
```

## Notes

- Redis cache keys use the format `hotels:<city>` and expire after one hour.
- The current supplier data is stored in memory and is intended for demonstration or assignment use.
- The Docker setup runs the development script with Nodemon. A production deployment should use a compiled build and a process manager or container restart policy.
