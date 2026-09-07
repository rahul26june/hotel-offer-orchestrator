# Hotel Offer Orchestrator

An Express and TypeScript service that combines hotel offers from two suppliers. When the same hotel is returned by both suppliers, the offer with the lowest price is kept. Results are cached in Redis for one hour.  
Hotel fetching and deduplication is orchestrated using **Temporal workflows**, ensuring parallel supplier calls and resilience.

---

## Requirements

- Node.js 18 or later
- npm
- Docker Desktop with Docker Compose (recommended for running the complete stack)
- Temporal server (via Docker image `temporalio/auto`)

---

## Setup

Install the project dependencies:

```bash
npm install

Check the TypeScript source without starting the server:

npx tsc --noEmit

Run With Docker Compose

Docker Compose starts both the API and its Redis dependency. From the project root, run:

docker compose up --build

The API is available at http://localhost:3000. To run it in the background:

docker compose up --build -d

Stop the services with:

docker compose down

The application connects to Redis using the Compose service name redis, so Compose is the recommended way to run the full application locally.

Run the Development Server

The development script uses Nodemon and restarts the TypeScript server when source files change:

npm run dev

The application expects Redis to be reachable at host redis on port 6379. Use Docker Compose unless a Redis instance is available under that hostname.

Run Temporal

Start the Temporal server locally (in a separate terminal):

docker run -d -p 7233:7233 temporalio/auto

Run the Temporal worker:

npx ts-node src/worker.ts

The Express API will now trigger the Temporal workflow (hotelWorkflow) to fetch Supplier A and Supplier B in parallel, deduplicate, and return the best-priced hotels. Results are cached in Redis after workflow completion.

API Endpoints

Get hotels

GET /api/hotels?city=delhi

Optional price filters can be supplied:

GET /api/hotels?city=delhi&minPrice=5500&maxPrice=7000

The city query parameter is required. Requests without it return HTTP 400. Unknown cities return an empty array.

Example response:

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

Health check

GET /health

Returns the API and Redis connection status.

Supplier data

GET /supplierA/hotels
GET /supplierB/hotels

These endpoints return the current mock supplier data.

Postman

Import [Looks like the result wasn't safe to show. Let's switch things up and try something else!] into Postman to run the included requests for:

Merged results

Price filtering

Empty results

Supplier data

Health check

Supplier down simulation

Temporal workflow execution (parallel supplier calls)

Project Structure

src/
  index.ts          Express server and API routes
  orchestrator.ts   Temporal workflow (parallel supplier calls + deduplication)
  activities.ts     Supplier fetch activities
  worker.ts         Temporal worker
  types.ts          Shared hotel type
  suppliers.ts      Mock supplier data
Dockerfile          Container image definition
docker-compose.yml  API and Redis services

Notes

Redis cache keys use the format hotels:<city> and expire after one hour.

Supplier data is stored in memory and is intended for demonstration or assignment use.

Temporal orchestrates supplier calls in parallel, ensuring resilience and workflow visibility.

The Docker setup runs the development script with Nodemon. A production deployment should use a compiled build and a process manager or container restart policy.

```
