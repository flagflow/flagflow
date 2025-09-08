# Update OpenAPI

Updates the OpenAPI specification in `src/routes/api/openapi.json` by analyzing all API routes in `src/routes/api/` and generating a comprehensive schema with endpoints, parameters, request bodies, and responses.

## What this command does

1. Scans all SvelteKit API route files (`+server.ts`) in the `src/routes/api/` directory
2. Analyzes Zod schemas used for request validation in route handlers
3. Generates proper OpenAPI 3.0 schema definitions for all endpoints
4. Updates the existing `src/routes/api/openapi.json` file with current API structure
5. Maintains existing version info and server configuration
6. Creates clean, standards-compliant OpenAPI documentation

## API Routes Covered

- `GET /api/` - Returns the OpenAPI specification
- `POST /api/login` - User authentication with username/password
- `POST /api/logout` - User logout (requires auth)
- `GET /api/sessions` - List all active user sessions (requires auth)
- `DELETE /api/sessions/{id}` - Delete specific session (requires auth)
- `GET /api/users` - List all users (requires auth)
- `POST /api/users` - Create new user (requires auth)
- `PATCH /api/users/{key}` - Update existing user (requires auth)
- `DELETE /api/users/{key}` - Delete user (requires auth)

## Schema Generation

The command automatically:

- Extracts Zod validation schemas from route handlers
- Converts them to proper OpenAPI schema definitions
- Includes request/response body schemas
- Documents path parameters and query parameters
- Sets up proper authentication requirements
- Defines reusable component schemas
