# Changelog

All notable changes to FlagFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-09-16

### Added

- **REST API Enhancements**: Comprehensive REST API with OpenAPI 3.0 specification
- Complete RESTful endpoints for users, sessions, flags, and migrations management
- API authentication via JWT Bearer tokens with consistent error handling
- OpenAPI documentation available at `/api/openapi.json` endpoint
- REST API support for flag migrations via GET (export), PUT (execute from file), PATCH (execute from remote URL)

### Enhanced

- **User Management**: Enhanced user authentication and session management
- Password-based authentication system with secure credential handling
- Improved user session lifecycle with automatic cleanup and TTL management
- Enhanced user permission validation and role-based access control
- Strengthened authentication flow with JWT token validation and JWKS integration

### Technical Improvements

- REST API layer with consistent response formatting via `$lib/Response.ts`
- Enhanced middleware chain with logging, authentication, and permission-based authorization
- Improved error handling and validation with detailed Zod error formatting
- Server-side RPC caller for internal service communication
- Enhanced session service with debounced touching (5s intervals) and automatic maintenance

## [1.6.0] - 2025-08-28

### Added

- **Object Flag Type Support**: Full implementation of OBJECT flag type with JavaScript object syntax
- Object schema parsing with TypeScript and Zod generation
- JavaScript object string validation with support for nested objects, arrays, and complex types
- Object flag UI components for schema definition and value editing
- TypeScript type generation for object flags with nested object support
- Zod schema validation for object flags with comprehensive type checking

### Enhanced

- Flag API formatter now returns proper object types for OBJECT flags instead of strings
- Flag validation system extended to support object schema validation
- Flag comparison and update logic enhanced for object flags
- TypeScript flag generation improved with object schema support

### Technical Improvements

- Object flag parser with grammar support for complex nested structures
- JavaScript object string parsing with proper quote handling and JSON conversion
- Enhanced flag handlers with object-specific formatting and validation
- Comprehensive test coverage for object flag validation and parsing
- Object flag empty instances with example schemas and default values

## [1.5.0] - 2025-08-27

### Added

- Comprehensive unit test suite with Vitest and @testing-library/svelte integration
- E2E test engine with in-memory mocks for RPC testing
- Audit logging system with structured logging and trace ID correlation
- Enhanced logging infrastructure with Pino and pretty formatting for development
- Group operations functionality for feature flag management
- PersistentService abstraction layer supporting both etcd and filesystem storage
- Dual-engine persistence system (etcd for distributed, filesystem for local)
- MockPersistentService with InMemoryPersistentEngine for testing isolation

### Changed

- Improved build system and CI/CD pipeline reliability
- Enhanced test coverage across core services and RPC endpoints
- Updated documentation with comprehensive testing and architecture details
- Strengthened service architecture with better separation of concerns

### Technical Improvements

- Service layer now supports pluggable persistence engines
- Test environment uses isolated in-memory state for better test reliability
- Real-time flag watching supported in both production and test environments
- Enhanced type safety with Zod schema validation throughout persistence layer

## [1.4.6] - 2025-08-18

### Added

- Version header display in the application interface
- Using Docker Buildx

### Changed

- Updated dependencies to latest versions
- Enhanced CI/CD pipeline with Docker Buildx for cross-platform builds
- Improved Docker publishing workflow with vulnerability scanning

## [1.4.4] - 2025-08-13

### Added

- curl command line tool added to Docker container for debugging and health checks
- OCI container image labels for better metadata and registry compatibility

### Changed

- Updated dependencies to latest versions
- First user is now automatically created with all permissions for easier initial setup

### Fixed

- Improved GitHub Actions permissions for proper CI/CD pipeline execution
- Health check endpoint now properly handles configurations where Keycloak is not used (returns NOTUSED status)

## [1.4.2] - 2025-08-09

### First release built by github pipeline

## [1.4.0] - 2025-08-09

### 🎉 First Public Release

This marks the first public release of FlagFlow as an open source project under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

### Added

- **Feature Flag Management System**
  - Real-time flag management with etcd watchers
  - Support for multiple flag types: Boolean, Integer, String, Object, Enum, Tag, AB-Test
  - Kill switch functionality for critical boolean flags with confirmation dialogs
  - Type-safe integration with TypeScript/Zod code generation

- **Authentication & Authorization**
  - Keycloak integration with JWT authentication
  - Role-based permission system with granular access control
  - Session management with automatic cleanup
  - User management interface

- **Web Administration Interface**
  - Modern SvelteKit 5 application with TypeScript
  - Responsive design with TailwindCSS and Flowbite components
  - Real-time flag updates and monitoring
  - Flag hierarchy visualization and management

- **API Endpoints**
  - RESTful API for flag access (`/flag/{flagname}`, `/flags/{flaggroup}`)
  - TypeScript type definition generation (`/type/typescript`)
  - Zod schema generation (`/type/zod`)
  - Migration and export functionality (`/migration/export`)
  - Health check endpoint (`/health`)

- **Migration System**
  - Flag import/export between environments
  - Backup and restore functionality
  - Hash-based group validation for type safety

- **Infrastructure & Development**
  - Docker containerization with multi-stage builds
  - Comprehensive development toolchain (linting, formatting, type checking)
  - Infrastructure scripts for etcd and Keycloak setup
  - Structured logging with Pino and trace IDs

- **Documentation**
  - Comprehensive README with setup and usage instructions
  - CONTRIBUTING.md with development guidelines
  - LICENSE.md with CC BY-NC-SA 4.0 license
  - CLAUDE.md with architectural documentation

### Technical Specifications

- **Backend**: Node.js 22+ with SvelteKit 5
- **Database**: etcd (distributed key-value store)
- **Authentication**: Keycloak with JWT tokens
- **API**: tRPC for type-safe client-server communication
- **Container**: Awilix dependency injection system
- **Frontend**: TypeScript, TailwindCSS, Flowbite components
