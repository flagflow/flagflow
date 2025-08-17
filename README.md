# FlagFlow

[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-FF3E00?style=flat&logo=svelte)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![etcd](https://img.shields.io/badge/etcd-419EDA?style=flat&logo=etcd&logoColor=white)](https://etcd.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

A modern feature flag management system built with SvelteKit 5, TypeScript, and etcd. FlagFlow provides real-time flag management with role-based access control, type-safe client integration, and a web-based administration interface.

🌐 **Live Demo**: [demo.flagflow.net](https://demo.flagflow.net)

🌐 **Document site**: [flagflow.net](https://flagflow.net)

## Features

- **Real-time flag management** with etcd watchers
- **Type-safe integration** with TypeScript/Zod code generation
- **Role-based access control** with Keycloak authentication
- **Multiple flag types**: Boolean (with killswitches), Integer, String, Object, Enum, Tag, AB-Test
- **Migration system** for flag import/export between environments
- **Web administration interface** with responsive design
- **API endpoints** for programmatic flag access

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes and version history.

## Prerequisites

- Node.js 22+
- Docker (for infrastructure dependencies)

## Quick Start

### 1. Infrastructure Setup

Start the required services using the provided scripts:

```bash
# Start etcd (distributed key-value store)
./infra/etcd.sh

# Start Keycloak (authentication provider)
./infra/keycloak.sh
```

These scripts will run:

- **etcd** on port 2379 (root password: `flagflow`)
- **Keycloak** on port 8080 (admin credentials: `admin`/`admin`)

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

### Configuration Options

#### Core Settings

- `LOGLEVEL`: Logging level (default: `info`)
  - Options: `trace`, `debug`, `info`, `warn`, `error`
- `ENVIRONMENT`: Environment identifier (e.g., `DEV`, `STAGING`, `PROD`)

#### Database (etcd) Configuration

- `ETCD_SERVER`: etcd connection string (default: `localhost:2379`)
- `ETCD_USERNAME`: etcd username (e.g., `root`)
- `ETCD_PASSWORD`: etcd password
- `ETCD_NAMESPACE`: etcd namespace (default: `default`)

#### Authentication (Keycloak) Configuration

- `KEYCLOAK_HOST`: Keycloak server URL (e.g., `http://localhost:8080/`)
- `KEYCLOAK_REALM`: Keycloak realm (default: `master`)
- `KEYCLOAK_CLIENT`: Keycloak client ID (default: `flagflow-frontend`)

#### Session Management

- `SESSION_USERS_ENABLED`: Enable built-in user sessions (default: `true`)
- `SESSION_DEFAULT_USERNAME`: Default user username for auto-creation
- `SESSION_DEFAULT_PASSWORD`: Default user password for auto-creation
- `SESSION_TIMEOUT_SEC`: Session timeout in seconds (default: `1800` = 30 minutes)

#### Migration & Import/Export

- `MIGRATION_SOURCE_ENVIRONMENT`: Source environment name for migrations
- `MIGRATION_SOURCE_URL`: Source URL for flag export/import operations

#### Monitoring & Development

- `METRICS_ENABLED`: Enable Prometheus metrics (default: `false`)
- `DEV_RPC_SLOWDOWN_MS`: Artificial RPC delay for development (default: `0`)

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development Commands

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start development server with formatted logs        |
| `npm run dev-rawlog`   | Start development server with raw logs              |
| `npm run build`        | Build for production                                |
| `npm run preview`      | Preview production build                            |
| `npm run test`         | Run test suite                                      |
| `npm run ts:check`     | TypeScript type checking                            |
| `npm run lint:check`   | Check linting rules                                 |
| `npm run lint:fix`     | Auto-fix linting issues                             |
| `npm run format:check` | Check code formatting                               |
| `npm run format:fix`   | Auto-fix code formatting                            |
| `npm run all`          | Run full pipeline (format, lint, type-check, build) |

## Docker Deployment

### Build Docker Image

```bash
npm run docker:build
```

### Run Docker Container

```bash
npm run docker:run
```

The container runs on port 3000 and requires an `.env` file for configuration.

## Route Structure

```mermaid
graph LR
    A["/"] --> B["/(ui)/"]
    B --> C["/(menu)/"]
    B --> D["/(plain)/"]

    C --> E["/ui/flags"]
    C --> F["/ui/users"]
    C --> G["/ui/sessions"]
    C --> H["/ui/migration"]

    D --> I["/login"]
    D --> J["/logout"]

    A --> K["/auth/keycloak/callback"]
    A --> L["/api/"]

    L --> M["/flag/[...flagname]"]
    L --> N["/flags/[...flaggroup]"]
    L --> O["/type/typescript"]
    L --> P["/type/zod"]
    L --> Q["/type/hash"]
    L --> R["/migration/export"]
    L --> S["/health"]

    E --> E1["Flag Management UI"]
    F --> F1["User Administration"]
    G --> G1["Session Management"]
    H --> H1["Migration Tools"]
    I --> I1["Login Form"]
    J --> J1["Logout Handler"]
    K --> K1["SSO Callback"]
    M --> M1["Single Flag API"]
    N --> N1["Flag Group API"]
    O --> O1["TS Types Export"]
    P --> P1["Zod Schemas Export"]
    Q --> Q1["Hash Validation"]
    R --> R1["Export/Import"]
    S --> S1["Health Check"]

    classDef ui fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef auth fill:#fff3e0

    class E,F,G,H,I ui
    class M,N,O,P,Q,R,S api
    class J,K auth
```

## RPC Architecture

```mermaid
graph TD
    A[Client Request] --> B[tRPC Router]
    B --> C{Route Type}

    C -->|Public| D[Public Routes]
    C -->|Protected| E[Protected Routes]

    D --> D1[login]

    E --> E1[session]
    E --> E2[user]
    E --> E3[flag]
    E --> E4[migration]

    B --> F[Middleware Chain]
    F --> F1[Logger Middleware]
    F1 --> F2[Auth Middleware]
    F2 --> F3[Permission Check]

    F3 --> G[Context Creation]
    G --> H[Service Container]
    H --> I[Service Resolution]

    I --> I1[SessionService]
    I --> I2[UserService]
    I --> I3[FlagService]
    I --> I4[PersistentService]

    E1 --> J1[Session Operations]
    E2 --> J2[User Management]
    E3 --> J3[Flag CRUD & Watching]
    E4 --> J4[Export/Import]

    J1 --> K[etcd Storage]
    J2 --> K
    J3 --> K
    J4 --> K

    classDef public fill:#e8f5e8
    classDef protected fill:#fff2cc
    classDef middleware fill:#e1f5fe
    classDef services fill:#f3e5f5
    classDef storage fill:#ffebee

    class D,D1 public
    class E,E1,E2,E3,E4 protected
    class F,F1,F2,F3 middleware
    class I,I1,I2,I3,I4 services
    class K storage
```

## Service & Persistence Architecture

```mermaid
graph TD
    A[Service Container] --> B[Service Layers]

    B --> C[System Services]
    B --> D[Core Services]
    B --> E[Business Services]

    C --> C1[ConfigService]
    C --> C2[LogService]
    C --> C3[HttpClientService]
    C --> C4[PersistentService]

    D --> D1[SessionService]
    D --> D2[UserService]
    D --> D3[MaintenanceService]

    E --> E1[FlagService]
    E1 --> E1A[TSFileGenerator]
    E1 --> E1B[GroupHashGenerator]
    E1 --> E1C[Migration]

    C4 --> F[Persistence Instance]
    F --> G{Engine Selection}

    G -->|ETCD_SERVER exists| H[etcdEngine]
    G -->|No ETCD_SERVER| I[fsEngine]

    H --> H1[etcd Client]
    H1 --> H2[etcd Cluster]

    I --> I1[File System]
    I1 --> I2[Local JSON Files]

    F --> J[Persistence Operations]
    J --> J1[get/getOrThrow]
    J --> J2[put/overwrite]
    J --> J3[delete/exists]
    J --> J4[list/watch]
    J --> J5[touch/status]

    J1 --> K[Schema Validation]
    J2 --> K
    J3 --> K
    K --> L[Zod Schema Parse]

    D1 --> M[Session Management]
    D2 --> N[User Operations]
    E1 --> O[Flag Management]

    M --> F
    N --> F
    O --> F

    classDef system fill:#e8f5e8
    classDef core fill:#fff2cc
    classDef business fill:#e1f5fe
    classDef persistence fill:#f3e5f5
    classDef engine fill:#ffebee
    classDef operations fill:#fce4ec

    class C,C1,C2,C3,C4 system
    class D,D1,D2,D3 core
    class E,E1,E1A,E1B,E1C business
    class F,G,K,L persistence
    class H,H1,H2,I,I1,I2 engine
    class J,J1,J2,J3,J4,J5 operations
```

## Architecture

FlagFlow follows a layered service architecture with dependency injection:

### Technology Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Database**: etcd (distributed key-value store)
- **Authentication**: Keycloak with JWT
- **API**: tRPC for type-safe communication
- **Styling**: TailwindCSS with Flowbite components
- **Logging**: Pino with structured logging

### Service Layers

1. **System Services**: Configuration, etcd client, HTTP client, logging
2. **Core Services**: Session management, user operations, maintenance
3. **Business Services**: Feature flag management with real-time watching

## Flag Types

FlagFlow supports multiple flag types with runtime validation:

- **BOOLEAN**: Simple on/off toggles (can be marked as killswitches)
- **INTEGER**: Numeric values with optional min/max constraints
- **STRING**: Text values with optional pattern validation
- **OBJECT**: Complex JSON objects with Zod schema validation
- **ENUM**: Predefined list of values
- **TAG**: String tags for categorization
- **AB-TEST**: A/B testing configurations

## API Usage

### Flag Access Endpoints

```bash
# Get single flag value
GET /flag/{flagname}

# Get flags by group
GET /flags/{flaggroup}

# Get TypeScript type definitions
GET /type/typescript

# Get Zod schemas
GET /type/zod
```

### Migration Endpoints

```bash
# Export flags for backup/migration
GET /migration/export

# Health check
GET /health
```

## User Permissions

FlagFlow includes a role-based permission system:

- **flag-create**: Can create, rename/move, and delete flags
- **flag-schema**: Can manage flag schemas
- **flag-value**: Can manage flag values
- **users**: Can add, modify, or remove users and manage sessions
- **migration**: Can restore backups or execute migrations

## Development Notes

- All services use structured logging with trace IDs
- Real-time updates via etcd watchers ensure immediate flag propagation
- Comprehensive type safety from database to UI using Zod schemas
- Container runs maintenance tasks every 113 seconds for cleanup
- Kill switches require confirmation dialogs for critical toggles

## Infrastructure Scripts

The `infra/` folder contains Docker commands for running dependencies:

- `etcd.sh`: Runs etcd 3.6.1 with root password `flagflow`
- `keycloak.sh`: Runs Keycloak 26.2.5 in development mode

Both containers use `--network=host` for easy local development access.

## Contributing

1. Follow the existing code conventions and patterns
2. Maintain type safety from database to UI
3. Use structured logging with trace IDs
4. Always include confirmation dialogs for destructive actions
5. Run `npm run all` before committing to ensure code quality

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License. See the [LICENSE.md](LICENSE.md) file for details.

You are free to use, modify, and distribute this software for non-commercial purposes under the same license terms.
