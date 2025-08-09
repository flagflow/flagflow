# Contributing to FlagFlow

We welcome contributions to FlagFlow! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 22+
- Docker (for infrastructure dependencies)

### Getting Started

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/flagflow.git
   cd flagflow
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up infrastructure:

   ```bash
   # Start etcd
   ./infra/etcd.sh

   # Start Keycloak
   ./infra/keycloak.sh
   ```

5. Configure environment:

   ```bash
   cp .env.example .env
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Code Quality Pipeline

Before submitting any changes, run the full quality pipeline:

```bash
npm run all
```

This command runs:

- Code formatting (`npm run format:fix`)
- Linting (`npm run lint:fix`)
- Type checking (`npm run ts:check`)
- Build verification (`npm run build`)

### Individual Commands

| Command                                       | Purpose                                |
| --------------------------------------------- | -------------------------------------- |
| `npm run dev`                                 | Development server with formatted logs |
| `npm run test`                                | Run test suite                         |
| `npm run ts:check`                            | TypeScript type checking               |
| `npm run lint:check` / `npm run lint:fix`     | ESLint checking/fixing                 |
| `npm run format:check` / `npm run format:fix` | Prettier formatting                    |
| `npm run build`                               | Production build                       |

## Code Standards

### Style Guidelines

- **No unnecessary brackets**: Omit `{}` for single-line blocks
- **No dynamic imports**: Avoid `import()` statements
- **Type safety**: Maintain comprehensive type safety from database to UI using Zod schemas
- **Structured logging**: Use trace IDs for all service operations
- **Confirmation dialogs**: Always include for destructive actions (especially kill switches)

### Architecture Patterns

- Follow the existing layered service architecture with dependency injection
- Use the Awilix container system for service registration
- Maintain real-time updates via etcd watchers
- Follow existing patterns in component organization and naming

### File Organization

```
src/
├── lib/server/services/
│   ├── systemServices/     # Config, etcd, HTTP, logging
│   ├── coreServices/       # Session, user, maintenance
│   └── [business services] # Feature-specific services
├── components/             # Reusable UI components
├── routes/                 # SvelteKit file-based routing
└── types/                  # TypeScript definitions
```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Your Changes

- Follow existing code patterns and conventions
- Add/update tests as appropriate
- Update documentation if needed
- Ensure type safety is maintained

### 3. Test Your Changes

```bash
# Run tests
npm run test

# Run full quality pipeline
npm run all
```

### 4. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new flag validation feature"
git commit -m "fix: resolve etcd connection timeout"
git commit -m "docs: update API documentation"
```

Commit types:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### 5. Submit a Pull Request

1. Push your branch to your fork
2. Create a pull request against the main repository
3. Include a clear description of your changes
4. Reference any related issues

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project conventions
- [ ] All tests pass (`npm run test`)
- [ ] Code quality pipeline passes (`npm run all`)
- [ ] Changes are well documented
- [ ] Commit messages follow conventional format

### PR Description

Include:

- **Summary**: What changes were made and why
- **Testing**: How the changes were tested
- **Breaking Changes**: Any backwards compatibility issues
- **Related Issues**: Link to relevant issue numbers

## Flag Development Guidelines

### Flag Types

When working with flags, understand the supported types:

- **BOOLEAN**: Simple toggles (can be marked as `isKillSwitch`)
- **INTEGER**: Numeric values with optional constraints
- **STRING**: Text values with optional pattern validation
- **OBJECT**: Complex JSON with Zod schema validation
- **ENUM**: Predefined value lists
- **TAG**: String tags for categorization
- **AB-TEST**: A/B testing configurations

### Kill Switches

Kill switches are critical boolean flags that require special handling:

- Always include confirmation dialogs
- Follow existing patterns in the UI
- Test thoroughly before submitting

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Place tests alongside source files or in `__tests__` directories
- Use descriptive test names
- Test both happy path and error scenarios
- Mock external dependencies appropriately

## Getting Help

- Check existing documentation in `CLAUDE.md`
- Review similar implementations in the codebase
- Open an issue for questions or discussions
- Join community discussions (if applicable)

## License

By contributing to FlagFlow, you agree that your contributions will be licensed under the same Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License as the project.

## Recognition

Contributors will be recognized in the project documentation and release notes. Thank you for helping make FlagFlow better!
