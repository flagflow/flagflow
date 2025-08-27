# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` (with pretty logs) or `npm run dev-rawlog` (raw logs)
- **Build**: `npm run build`
- **Type checking**: `npm run ts:check`
- **Linting**: `npm run lint:check` (check) or `npm run lint:fix` (fix)
- **Formatting**: `npm run format:check` (check) or `npm run format:fix` (fix)
- **Full pipeline**: `npm run all` (formats, lints, type-checks, and builds)
- **Tests**: `npm run test` (runs vitest) or `npm run test:coverage` (with coverage report)
- **Docker interactive**: `npm run docker:it` (interactive shell in container)
- **Preview**: `npm run preview` (with pretty logs) or `npm run preview-raw` (raw logs)
- **Docker**: `npm run docker:build` and `npm run docker:run`
- **Full rebuild of npm packages**: `npm run npm:reinstall`

### Testing Commands

- **Run tests**: `npm run test` (Vitest with @testing-library/svelte)
- **Run specific tests**: `npm run test -- --run <test-file-pattern>` (e.g., `npm run test -- --run flagService`)
- **Test environment**: Node.js with E2E test setup at `tests/e2e/setup.ts`
- **Test exclusions**: Svelte files are excluded from testing by default
- **E2E Testing**: Comprehensive RPC testing with in-memory mocks via `MockPersistentService`

## Architecture Overview

### Core Technology Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Database**: etcd (distributed key-value store)
- **Authentication**: Keycloak integration with JWT
- **API**: tRPC for type-safe client-server communication
- **Dependency Injection**: Awilix container system
- **Styling**: TailwindCSS 4 with Flowbite components
- **Logging**: Pino with pretty formatting

### Service Architecture

The application follows a layered service architecture with Awilix dependency injection:

1. **System Services** (`src/lib/server/services/systemServices/`):
   - `ConfigService`: Environment configuration management using env-var
   - `EtcdService`: etcd client wrapper with namespace support and connection pooling
   - `HttpClientService`: HTTP client with interceptors and timeout handling
   - `LogService`: Structured logging with Pino and trace ID correlation

2. **Core Services** (`src/lib/server/services/coreServices/`):
   - `SessionService`: User session management with debounced touching (5s) and TTL
   - `UserService`: User operations, authentication, and permission validation
   - `MaintenanceService`: Background cleanup tasks running every 113 seconds

3. **Business Services** (`src/lib/server/services/FlagService/`):
   - `FlagService`: Feature flag management with real-time etcd watching
   - `TSFileGenerator`: TypeScript code generation for client integration
   - `GroupHashGenerator`: Hash validation for flag groups
   - `Migration`: Export/import system for flag management

### Key Architectural Components

#### Dependency Injection Container (`src/lib/server/container.ts`)

- Uses Awilix for IoC container with scoped and singleton services
- Services are registered with proper lifecycle management
- Container cleanup includes maintenance timer and etcd client disposal

#### RPC Layer (`src/lib/rpc/`)

- tRPC setup with superjson transformer for complex type serialization
- Context creation with authentication, tracing, and service injection
- Middleware chain: logging → authentication → permission-based authorization
- Route organization: `public/` (login/auth) and `protected/` (flag/user/session/migration operations)
- Enhanced Zod error formatting with detailed validation messages
- Server-side RPC caller for internal service communication

#### Feature Flag System

- Real-time flag watching with etcd watchers
- TypeScript/Zod type generation from flag schemas
- Support for BOOLEAN (with killswitch), INTEGER, STRING, OBJECT, ENUM, TAG, AB-TEST flag types
- **Object flags**: Support JavaScript object syntax strings with schema validation and TypeScript generation
- Migration system for flag changes with export/import
- Hash-based group validation for type safety
- Kill switches: special boolean flags requiring confirmation to disable

#### Authentication Flow

- Keycloak integration for SSO
- JWT token validation with JWKS
- Session management with automatic cleanup
- Role-based access control

### Data Types (`src/types/persistent/`)

- Strongly typed etcd data models
- Zod schemas for runtime validation
- Flag type definitions with validation rules
- User session and authentication types

### Frontend Structure

#### Route Organization (`src/routes/`)

- **File-based routing** with nested layouts and server load functions
- **Route groups**: `(ui)/` for authenticated pages, `(menu)/` with navigation, `(plain)/` for simple pages
- **API endpoints**: `/flag/{flagname}`, `/flags/{flaggroup}`, `/type/typescript`, `/migration/export`
- **Authentication callbacks**: `/auth/` for Keycloak integration

#### Component Architecture (`src/components/`)

- **Atomic design principles** with reusable components
- **Form components** with validation in `form/` directory
- **Modal portal system** with show functions (`showModalError`, `showModalConfirmation`)
- **Icon system** using Iconify with centralized Icon.svelte component
- **Path aliases**: $components, $lib, $rpc, $types for clean imports

### Development Notes

- Node.js 22+ required
- All services use structured logging with trace IDs
- etcd is used for all persistent data storage
- Real-time updates via etcd watchers
- Comprehensive type safety from database to UI
- Container runs maintenance tasks every 113 seconds for cleanup
- Environment configuration via `.env` file (see `.env.example`)

### Infrastructure Setup

Before development, start required services:

- etcd: `./infra/etcd.sh` (port 2379, root password: `flagflow`)
- Keycloak: `./infra/keycloak.sh` (port 8080, admin: `admin`/`admin`)
- Alternative: `npm run docker:compose:up` for full infrastructure setup

### Flag Type Patterns

- **Boolean flags**: Can be marked as `isKillSwitch` for critical toggles
- **Value precedence**: `value` (if `valueExists: true`) > `defaultValue`
- **Group structure**: Flags organized in hierarchical groups using `/` separator
- **Type safety**: All flag types have Zod schemas with runtime validation

### UI Patterns

- File-based routing with nested layouts in `src/routes`
- Modal system using show functions (e.g., `showModalError`, `showModalConfirmation`)
- Form components with validation in `src/components/form/`
- Icons using Iconify with `src/components/Icon.svelte`
- Responsive design with TailwindCSS and Flowbite components

### Development Patterns & Best Practices

#### Code Style Rules

- Do not use brackets `{}` if not needed, especially for single-line command blocks
- Do not use dynamic `import()` - use static imports for better type safety
- Prefer TypeScript strict mode with comprehensive type annotations
- Use path aliases (`$lib`, `$components`, etc.) for clean import statements

#### Security & Safety Rules

- Always use confirmation dialogs for destructive actions (especially kill switches)
- Maintain comprehensive type safety from database to UI using Zod schemas
- Use structured logging with trace IDs for all service operations
- Never commit secrets or environment variables to the repository
- All etcd data must use Zod schemas for runtime validation

#### Architecture Rules

- Services must be registered in the Awilix container with proper lifecycle (singleton/scoped)
- All database operations should go through service layer, never direct etcd access
- Use permission-based access control via tRPC middleware
- Real-time updates should use etcd watchers, not polling
- Session management uses debounced touching with 5-second intervals

#### Permission System

FlagFlow uses role-based permissions:

- `flag-create`: Create, rename/move, and delete flags
- `flag-schema`: Manage flag schemas and types
- `flag-value`: Manage flag values and configurations
- `users`: Add, modify, or remove users and manage sessions
- `migration`: Restore backups or execute migrations

## Testing Architecture

### E2E Test Engine

The codebase includes a comprehensive E2E test engine for RPC testing:

- **In-memory persistence**: `MockPersistentService` with `InMemoryPersistentEngine` replaces etcd/filesystem for testing
- **Real-time watchers**: Full support for flag watching and events in test environment
- **Authentication mocking**: User contexts with configurable permissions for testing authorization
- **State isolation**: `resetFlagServiceState()` function ensures clean test isolation
- **Module-level caching**: FlagService uses module-level state for performance with proper test reset

### Test Execution

```bash
# Run all tests
npm run test

# Run specific test files
npm run test -- --run <test-file-pattern>

# Examples
npm run test -- --run flagService     # Run FlagService tests
npm run test -- --run rpc.test.ts     # Run specific E2E RPC tests
```

## Docker Commands Context

Package.json Docker commands use `$npm_package_version` variable:

- `npm run docker:build` builds with current package version tag
- `npm run docker:run` runs the versioned container
- `npm run docker:it` provides interactive shell access
- `npm run docker:compose:up` starts full infrastructure stack
- `npm run docker:compose:down` stops infrastructure stack

## Key File Locations

- **Service definitions**: `src/lib/server/services/` (systemServices, coreServices, FlagService)
- **RPC routes**: `src/lib/rpc/protected/` and `src/lib/rpc/public/`
- **Persistent data types**: `src/types/persistent/` (all with Zod schemas)
- **Infrastructure scripts**: `./infra/etcd.sh`, `./infra/keycloak.sh`, and Docker Compose files
- **Route handlers**: `src/routes/` (SvelteKit file-based routing)
- **Client integration**: `src/lib/rpc/client.ts` for tRPC client setup
- **Persistent engines**: `src/lib/server/persistent/` (etcd and filesystem engines)
- **Test mocks**: `tests/mocks/` (MockPersistentService, InMemoryPersistentEngine)
- **E2E test setup**: `tests/e2e/setup.ts` (test context creation and utilities)

## Important Development Instructions

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User
- When working with etcd data, always validate using Zod schemas in `src/types/persistent/`

## Persistent Storage Architecture

FlagFlow uses a dual-engine persistence system:

- **etcdEngine**: When `ETCD_SERVER` is configured, uses etcd for distributed storage
- **fsEngine**: When no `ETCD_SERVER`, falls back to local filesystem JSON storage
- **PersistentService**: Unified interface abstracting engine differences
- **Schema validation**: All operations validated with Zod schemas from `src/types/persistent/`

## Testing Configuration

- **Framework**: Vitest with @testing-library/svelte integration
- **Environment**: Node.js test environment with E2E setup
- **Exclusions**: Svelte component files excluded by default
- **E2E Setup**: `tests/e2e/setup.ts` provides `createE2ETestContext()` for RPC testing
- **Path aliases**: Full support for `$lib`, `$components`, `$types`, `$rpc` in tests
- **Mock system**: Complete in-memory persistence layer for isolated testing
- **ESLint rules**: Configured to allow `toBeTruthy()` over `toBe(true)` in tests

## Audit Logging System

FlagFlow includes comprehensive audit logging:

- **Structured logging**: All operations logged with trace IDs using Pino
- **Audit trail**: User actions, flag changes, and system events tracked
- **Log correlation**: Trace IDs link related operations across service layers
- **Pretty formatting**: Development logs formatted for readability

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
