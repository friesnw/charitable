# Monorepo Template

A full-stack web application with a React frontend, Node.js backend, and PostgreSQL database.

## Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ───> │   Backend   │ ───> │  Database   │
│   (React)   │      │  (Node.js)  │      │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
   Port 3000            Port 4000            Port 5432
```

**How data flows:** The frontend (what users see in their browser) sends requests to the backend (the server). The backend processes these requests, reads or writes data to the database, and sends responses back to the frontend.

## Components

### Frontend (`/frontend`)

The user interface that runs in the browser.

- **React** - A library for building interactive user interfaces using reusable components
- **Vite** - A build tool that bundles the code and provides fast development reloads
- **Apollo Client** - Manages communication with the backend and caches data locally for performance

### Backend (`/backend`)

The server that handles business logic and data access.

- **Node.js** - JavaScript runtime that executes server-side code
- **Apollo Server** - Handles incoming requests using GraphQL (see below)
- **GraphQL** - A query language that lets the frontend request exactly the data it needs, no more, no less

### Database (PostgreSQL)

Stores all application data persistently. PostgreSQL is a reliable, open-source database used by companies like Apple, Spotify, and Instagram.

## Why GraphQL?

Traditional REST APIs have fixed endpoints that return fixed data structures. GraphQL offers:

- **Flexible queries** - Frontend developers can request exactly the fields they need
- **Single endpoint** - All requests go through one URL (`/graphql`) instead of many
- **Self-documenting** - The schema defines all available data and operations
- **Strongly typed** - Errors are caught early because data shapes are predefined

## Project Structure

```
monorepo-template/
├── frontend/           # React application
│   ├── .env.example    # Environment template
│   ├── codegen.ts      # GraphQL type generation config
│   └── src/
│       ├── App.tsx     # Main UI component
│       ├── apollo.ts   # Backend connection config
│       ├── gql/        # Generated GraphQL types
│       └── main.tsx    # App entry point
├── backend/            # Node.js server
│   ├── .env.example    # Environment template
│   ├── migrations/     # Database migrations
│   └── src/
│       ├── index.ts    # Server entry point
│       ├── env.ts      # Environment validation
│       ├── db.ts       # Database connection + migrations
│       ├── schema/     # GraphQL type definitions
│       └── resolvers/  # Request handlers
├── infrastructure/     # Deployment configuration
│   ├── deploy.sh       # Deployment helper script
│   └── README.md       # Detailed deployment guide
├── render.yaml         # Render.com infrastructure config
├── setup.sh            # One-command local setup
└── package.json        # Project configuration
```

## Getting Started

### Prerequisites

- macOS with [Homebrew](https://brew.sh) installed

### Setup

```bash
./setup.sh
```

This automatically installs Node.js, PostgreSQL, dependencies, and initializes the database.

### Running the App

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000 (GraphQL Playground for testing queries)

## Environment Configuration

Both frontend and backend use environment variables for configuration. The setup script creates `.env` files from the `.env.example` templates.

**Backend (`backend/.env`):**
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `4000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `app_db` |
| `DB_USER` | Database user | System user |
| `DB_PASSWORD` | Database password | (empty) |

**Frontend (`frontend/.env`):**
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:4000` |

Environment variables are validated on startup using Zod. If a required variable is missing or invalid, the app will fail fast with a clear error message.

## GraphQL Codegen

GraphQL Codegen automatically generates TypeScript types from your GraphQL schema and queries. This ensures your frontend code stays in sync with the backend API.

**How it works:**
1. The backend defines the GraphQL schema (types, queries, mutations)
2. Codegen connects to the running backend and reads the schema
3. It scans frontend code for GraphQL queries and generates matching TypeScript types
4. Your IDE provides autocomplete and type checking for all GraphQL operations

**Generating types:**

```bash
# Start the backend first
npm run backend

# In another terminal, generate types
npm run codegen
```

Generated types appear in `frontend/src/gql/`. Import and use them in your components for full type safety.

## Database Migrations

Migrations are SQL files that track changes to your database schema over time. They run automatically when the server starts, ensuring your database is always up to date.

**How it works:**
1. Each migration file in `backend/migrations/` contains an "up" section (apply changes) and a "down" section (undo changes)
2. The system tracks which migrations have run in a `pgmigrations` table
3. On server startup, any new migrations are applied automatically

**Creating a new migration:**

```bash
cd backend
npm run migrate:create -- my_migration_name
```

This creates a new timestamped file in `backend/migrations/`. Edit it to add your SQL changes.

## Deployment

This app is configured to deploy to [Render](https://render.com), a simple cloud platform.

**Quick deploy:**

```bash
./infrastructure/deploy.sh
```

This script pushes your code to GitHub and guides you through connecting to Render.

**What gets deployed:**
- Frontend → Static site (free)
- Backend → Web service (free tier available)
- Database → Managed PostgreSQL (free for 90 days)

See [infrastructure/README.md](infrastructure/README.md) for detailed instructions.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run frontend` | Start only the frontend |
| `npm run backend` | Start only the backend |
| `npm run build` | Build for production |
| `npm run codegen` | Generate GraphQL TypeScript types |
| `npm run migrate:create -w backend -- name` | Create a new migration |
