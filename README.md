# ShopSphere

ShopSphere is a React storefront frontend for the ShopSphere Spring Boot
backend. The browser talks to the backend through the API gateway; Vite proxies
`/api` requests to `http://localhost:8080` during local development.

## Requirements

- Node.js 20.19 or newer and npm
- Docker Compose for the backend's MySQL dependency
- Java 21 for the Spring Boot backend

## Run locally with the backend

The current checkout contains the frontend and project documentation, but not
the backend modules, Maven wrapper, Docker Compose file, or backend startup
scripts. You need a checkout of the ShopSphere backend source as well to run the
complete application. Backend startup commands below are run from that
backend checkout's root directory.

### 1. Start the backend

Configure the backend's required environment variables using its `.env.example`
or local setup instructions. Keep `.env` local and do not commit secrets.
Start MySQL, Eureka, the gateway, and the backend services using the backend
startup script:

```bash
cd /path/to/shopsphere-backend
./scripts/start-all.sh
```

The backend API gateway should be available at `http://localhost:8080`. The
backend documentation describes the startup script and its options in
[docs/collaborate.md](./docs/collaborate.md).

If the backend checkout does not provide `scripts/start-all.sh`, follow its
local setup guide to start MySQL first, then Eureka, the API gateway, and the
services. The frontend uses only the gateway; it must not connect directly to
individual service ports.

### 2. Start the frontend

In a second terminal, from this repository:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. The Vite development server forwards `/api`
requests to the gateway on port 8080. The default `VITE_API_BASE_URL` is empty
so the proxy is used; no frontend `.env` file is required for the standard
local setup.

To use a different gateway address, copy `frontend/.env.example` to
`frontend/.env` and set `VITE_API_BASE_URL` to that gateway's URL. Do not point
the frontend at an individual backend service.

## Frontend checks

Run these from `frontend/`:

```bash
npm run lint
npm run build
```

## Project documentation

- [Frontend requirements](./docs/frontend-requirements.md)
- [API contract](./docs/api-contract.md)
- [Backend collaboration and local setup](./docs/collaborate.md)
- [Service boundaries](./docs/service-boundaries.md)
