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

- Real-time flag watching with etcd
- TypeScript/Zod type generation from flag schemas
- Support for BOOLEAN, INTEGER, STRING flag types with validation
- Migration system for flag changes
- Hash-based group validation for type safety

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

### Rules

- Do not use brackets {} if not needed, at one line command in blocks
- Do not use dynamic import()
