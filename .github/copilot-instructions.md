# GitHub Copilot Instructions for FlagFlow

This document provides guidance for GitHub Copilot when working with the FlagFlow codebase.

## Technology Stack & Architecture

### Core Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Database**: etcd (distributed key-value store)
- **Authentication**: Keycloak integration with JWT
- **API**: tRPC for type-safe client-server communication
- **DI Container**: Awilix for dependency injection
- **Styling**: TailwindCSS 4 with Flowbite components
- **Logging**: Pino with structured logging and trace IDs
- **Testing**: Vitest with @testing-library/svelte

### Service Architecture

The application uses a layered service architecture with dependency injection:

1. **System Services** (`src/lib/server/services/systemServices/`):
   - `ConfigService`: Environment configuration with env-var
   - `EtcdService`: etcd client with namespace support
   - `HttpClientService`: HTTP client with interceptors
   - `LogService`: Structured logging with Pino

2. **Core Services** (`src/lib/server/services/coreServices/`):
   - `SessionService`: User sessions with debounced touching (5s)
   - `UserService`: Authentication and permission validation
   - `MaintenanceService`: Background cleanup (113s intervals)

3. **Business Services**:
   - `FlagService`: Feature flag management with real-time etcd watching

## Code Style Guidelines

### TypeScript Best Practices

- Use strict mode with comprehensive type annotations
- Prefer static imports over dynamic `import()` for better type safety
- Use path aliases (`$lib`, `$components`, `$rpc`, `$types`) for clean imports
- All etcd data must use Zod schemas for runtime validation

### Code Formatting Rules

- Do not use brackets `{}` if not needed, especially for single-line blocks
- Follow existing patterns in the codebase for consistency
- Use structured logging with trace IDs for all service operations

### Architecture Patterns

- Services must be registered in Awilix container with proper lifecycle
- All database operations go through service layer, never direct etcd access
- Use permission-based access control via tRPC middleware
- Real-time updates use etcd watchers, not polling
- Session management uses debounced touching with 5-second intervals

## Component Architecture

### Frontend Structure

- **File-based routing** with nested layouts in `src/routes/`
- **Route groups**: `(ui)/` for auth pages, `(menu)/` with nav, `(plain)/` for simple pages
- **Atomic design** with reusable components in `src/components/`
- **Modal system** using show functions (`showModalError`, `showModalConfirmation`)
- **Form components** with validation in `form/` directory
- **Icon system** using Iconify with centralized `Icon.svelte`

### RPC Layer

- tRPC with superjson transformer for complex types
- Context with authentication, tracing, and service injection
- Middleware chain: logging → authentication → authorization
- Routes: `public/` (login/auth) and `protected/` (operations)
- Enhanced Zod error formatting

## Feature Flag System

### Flag Types

- **BOOLEAN**: Simple on/off flags (can be marked as `isKillSwitch`)
- **INTEGER**: Numeric configuration values
- **STRING**: Text configuration
- **OBJECT**: Complex JSON data with Zod validation
- **ENUM**: Predefined value sets
- **TAG**: Tagging system for feature grouping
- **AB-TEST**: A/B testing configurations

### Flag Patterns

- **Value precedence**: `value` (if `valueExists: true`) > `defaultValue`
- **Group structure**: Hierarchical organization using `/` separator
- **Type safety**: All flag types have Zod schemas with runtime validation
- **Kill switches**: Critical boolean flags requiring confirmation to disable

## Security & Safety Rules

### Authentication & Authorization

- Keycloak integration for SSO with JWT validation
- Role-based permissions:
  - `flag-create`: Create, rename/move, delete flags
  - `flag-schema`: Manage flag schemas and types
  - `flag-value`: Manage flag values and configurations
  - `users`: User and session management
  - `migration`: Backup restore and migrations

### Safety Practices

- Always use confirmation dialogs for destructive actions
- Never commit secrets or environment variables
- Maintain type safety from database to UI using Zod
- Use structured logging with trace IDs for operations

## Development Commands

When suggesting development workflows, use these commands:

```bash
# Development
npm run dev              # Pretty logs
npm run dev-rawlog      # Raw logs

# Quality Assurance
npm run ts:check        # Type checking
npm run lint:check      # Linting (use lint:fix to fix)
npm run format:check    # Formatting (use format:fix to fix)
npm run test           # Run tests
npm run all            # Full pipeline

# Build & Deploy
npm run build          # Production build
npm run preview        # Preview build

# Docker
npm run docker:build   # Build container
npm run docker:run     # Run container
npm run docker:it      # Interactive shell
```

## Common Patterns to Follow

### Service Registration

```typescript
// Register services in container with proper lifecycle
container.register({
	myService: asClass(MyService).singleton(),
	scopedService: asClass(ScopedService).scoped()
});
```

### etcd Operations

```typescript
// Always use service layer, never direct etcd
const result = await this.etcdService.get('/flags/my-flag');
const validated = FlagSchema.parse(result);
```

### Error Handling

```typescript
// Use structured logging with trace IDs
this.logger.error({ error, traceId }, 'Operation failed');
```

### Modal Usage

```typescript
// Use show functions for modals
await showModalConfirmation({
	title: 'Confirm Action',
	message: 'Are you sure?'
});
```

### Form Validation

```typescript
// Use Zod schemas for validation
const schema = z.object({
	name: z.string().min(1),
	enabled: z.boolean()
});
```

## File Organization

### Path Structure

- `src/lib/server/services/` - Service layer
- `src/lib/rpc/` - tRPC setup and routes
- `src/components/` - Reusable UI components
- `src/routes/` - SvelteKit file-based routing
- `src/types/` - TypeScript type definitions
- `tests/` - Test files with Vitest

### Import Patterns

```typescript
// Use path aliases
import { MyComponent } from '$components/MyComponent.svelte';
import { myFunction } from '$lib/utils';
import type { MyType } from '$types/common';
import { api } from '$rpc/client';
```

## Infrastructure Notes

### Required Services

- etcd on port 2379 (root password: `flagflow`)
- Keycloak on port 8080 (admin: `admin`/`admin`)

### Environment Setup

- Node.js 22+ required
- Configuration via `.env` file (see `.env.example`)
- Use `./infra/etcd.sh` and `./infra/keycloak.sh` for local development

When generating code, follow these patterns and maintain consistency with the existing codebase architecture.
