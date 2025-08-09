# Changelog

All notable changes to FlagFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
