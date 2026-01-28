<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Cornerstone API

A robust, scalable backend API built with [NestJS](https://nestjs.com) and TypeScript for managing workspace collaboration, documents, chat, and AI-powered features.

## Description

Cornerstone API is a comprehensive backend solution designed to support collaborative workspaces with document management, real-time chat, user authentication, and AI integrations. It leverages modern technologies including TypeORM, PostgreSQL, Redis, AWS services (S3, SES, SQS), and OpenAI to deliver a production-ready platform.

## Features

- **Authentication & Authorization**: JWT-based authentication with Google OAuth integration and role-based access control
- **Workspace Management**: Multi-workspace support with user role assignments
- **Document Management**: Upload, store, and manage documents with vector indexing
- **Real-time Chat**: Chat flow system for user communication
- **User Management**: Comprehensive user profiles with invitation system
- **AI Integration**: OpenAI integration for AI-powered features
- **Cloud Storage**: AWS S3 integration for file storage
- **Email Services**: AWS SES for email communications
- **Message Queue**: AWS SQS for asynchronous processing
- **Caching**: Redis integration for performance optimization
- **Rate Limiting**: Request throttling with Redis storage

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: NestJS 11.x
- **ORM**: TypeORM with PostgreSQL
- **Authentication**: JWT, Passport, Google Auth
- **Cache**: Redis (ioredis)
- **AWS Services**: S3, SES, SQS
- **AI**: OpenAI API
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## Project Setup

```bash
$ npm install
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=cornerstone_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Application
PORT=3000
NODE_ENV=development
```

## Database Setup

Run migrations to set up the database schema:

```bash
# Run all pending migrations
$ npm run migration:run

# Generate a new migration after schema changes
$ npm run migration:generate -- src/migrations/MigrationName

# Revert the last migration
$ npm run migration:revert
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

### Docker Deployment

The project includes Dockerfiles for containerized deployment:

```bash
# Build the application image
$ docker build -f Dockerfile -t cornerstone-api:latest .

# Run the container
$ docker run -p 3000:3000 --env-file .env cornerstone-api:latest
```

### Database Migrations in Docker

```bash
# Build and run migrations
$ docker build -f Dockerfile.migrations -t cornerstone-api-migrations:latest .
$ docker run --env-file .env cornerstone-api-migrations:latest
```

### Production Deployment

For production environments:

1. Ensure all environment variables are properly configured
2. Run database migrations before deploying
3. Use a process manager like PM2 or systemd
4. Set up SSL/TLS certificates
5. Configure proper logging and monitoring
6. Use environment-specific build: `npm run start:prod`

## Project Structure

```
src/
├── auth/              # Authentication & JWT modules
├── chat/              # Chat flow and messaging
├── documents/         # Document management
├── users/             # User management
├── workspaces/        # Workspace management
├── redis/             # Redis integration
├── config/            # TypeORM and app configuration
├── migrations/        # Database migrations
├── roles/             # Role definitions
└── main.ts            # Application entry point

libs/
└── common/            # Shared utilities, decorators, guards, filters
```

## API Modules

### Auth Module
Handles user authentication, JWT token generation, and OAuth integration.

### Chat Module
Manages chat flows and real-time messaging between users.

### Documents Module
Provides document upload, storage, retrieval, and vector indexing for AI-powered search.

### Users Module
Manages user profiles, invitations, and user-related operations.

### Workspaces Module
Handles multi-workspace functionality and workspace member management.

### Common Module
Contains shared utilities, decorators, guards, filters, and services used across modules.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Official Course](https://courses.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)

## Contributing

When contributing to this project:

1. Follow the existing code style (enforced by ESLint)
2. Write tests for new features
3. Run `npm run format` and `npm run lint` before committing
4. Create migrations for database schema changes using `npm run migration:generate`

## License

This project is licensed under UNLICENSED. All rights reserved.

## Support

For support and questions, please contact the development team.

---

**Built with ❤️ using NestJS**
