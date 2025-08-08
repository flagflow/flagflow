# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` (with pretty logs) or `npm run dev-rawlog` (raw logs)
- **Build**: `npm run build`
- **Type checking**: `npm run ts:check`
- **Linting**: `npm run lint:check` (check) or `npm run lint:fix` (fix)
- **Formatting**: `npm run format:check` (check) or `npm run format:fix` (fix)
- **Full pipeline**: `npm run all` (formats, lints, type-checks, and builds)
- **Tests**: `npm run test` (runs vitest)
- **Preview**: `npm run preview` (with pretty logs) or `npm run preview-raw` (raw logs)
- **Docker**: `npm run docker:build` and `npm run docker:run`
- **Full rebuild of npm packages**: `npm run npm:reinstall`

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

The application follows a layered service architecture with dependency injection:

1. **System Services** (`src/lib/server/services/systemServices/`):
   - `ConfigService`: Environment configuration management
   - `EtcdService`: etcd client and operations
   - `HttpClientService`: HTTP client with interceptors
   - `LogService`: Structured logging with Pino

2. **Core Services** (`src/lib/server/services/coreServices/`):
   - `SessionService`: User session management
   - `UserService`: User operations and authentication
   - `MaintenanceService`: Background cleanup tasks

3. **Business Services**:
   - `FlagService`: Feature flag management with real-time watching

### Key Architectural Components

#### Dependency Injection Container (`src/lib/server/container.ts`)

- Uses Awilix for IoC container with scoped and singleton services
- Services are registered with proper lifecycle management
- Container cleanup includes maintenance timer and etcd client disposal

#### RPC Layer (`src/lib/rpc/`)

- tRPC setup with superjson transformer for type safety
- Context creation with authentication and tracing
- Middleware for authentication (`auth.ts`) and logging (`logger.ts`)
- Separate public and protected procedure types

#### Feature Flag System

- Real-time flag watching with etcd watchers
- TypeScript/Zod type generation from flag schemas
- Support for BOOLEAN (with killswitch), INTEGER, STRING, OBJECT, ENUM, TAG, AB-TEST flag types
- Migration system for flag changes with export/import
- Hash-based group validation for type safety
- Kill switches: special boolean flags requiring confirmation to disable

#### Authentication Flow

- Keycloak integration for SSO
- JWT token validation with JWKS
- Session management with automatic cleanup
- Role-based access control

### Data Types (`src/types/etcd/`)

- Strongly typed etcd data models
- Zod schemas for runtime validation
- Flag type definitions with validation rules
- User session and authentication types

### Frontend Structure

- **Routes**: File-based routing with nested layouts
- **Components**: Reusable UI components with form helpers
- **Stores**: Svelte stores for client-side state management
- **Modal System**: Centralized modal management

### Development Notes

- Node.js 22+ required
- All services use structured logging with trace IDs
- etcd is used for all persistent data storage
- Real-time updates via etcd watchers
- Comprehensive type safety from database to UI
- Container runs maintenance tasks every 113 seconds for cleanup
- Environment configuration via `.env` file (see `.env.example`)

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

### Rules

- Do not use brackets {} if not needed, at one line command in blocks
- Do not use dynamic import()
- Always use confirmation dialogs for destructive actions (especially kill switches)
- Maintain type safety from database to UI using Zod schemas
- Use structured logging with trace IDs for all service operations
