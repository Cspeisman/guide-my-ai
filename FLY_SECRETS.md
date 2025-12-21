# Fly.io Secrets Configuration

This document explains how to configure secrets for your Fly.io deployment.

## Required Secrets

### 1. AUTH_SECRET (Required)

A secure random string used for authentication. Generate one using:

```bash
openssl rand -base64 32
```

Set it on Fly.io:

```bash
fly secrets set AUTH_SECRET="your-generated-secret"
```

### 2. APP_URL (Recommended)

The base URL of your application. Replace `ai-profiles` with your app name:

```bash
fly secrets set APP_URL="https://ai-profiles.fly.dev"
```

### 3. Database Configuration

You have two options for database configuration:

#### Option A: Use Fly.io Volumes (Local SQLite)

If using local SQLite with Fly.io volumes, set:

```bash
fly secrets set DATABASE_PATH="/app/data/data.sqlite"
```

**Note:** You'll also need to create a volume:

```bash
fly volumes create data --size 1 --region iad
```

And update your `fly.toml` to mount it:

```toml
[mounts]
  source = "data"
  destination = "/app/data"
```

#### Option B: Use Turso (Remote Database - Recommended)

For better scalability and multi-region support, use Turso:

```bash
fly secrets set DATABASE_PATH="libsql://your-database.turso.io"
fly secrets set TURSO_AUTH_TOKEN="your-turso-auth-token"
```

To get a Turso database:

1. Sign up at https://turso.tech
2. Create a database
3. Get your database URL and auth token

## Viewing Current Secrets

List all secrets (values are hidden):

```bash
fly secrets list
```

## Removing Secrets

If you need to remove a secret:

```bash
fly secrets unset SECRET_NAME
```

## Local Development

For local development with Docker Compose, create a `.env` file (see `.env.example`):

```bash
cp .env.example .env
# Edit .env with your local values
```

Then run:

```bash
docker-compose up
```

The docker-compose.yml will automatically read from your `.env` file.

## Deployment Checklist

Before deploying to Fly.io, ensure:

- [ ] `AUTH_SECRET` is set to a secure random value
- [ ] `APP_URL` is set to your Fly.io app URL
- [ ] Database configuration is set (either local SQLite with volumes OR Turso)
- [ ] If using Turso, `TURSO_AUTH_TOKEN` is set

## Verifying Secrets

After setting secrets, you can verify by checking the logs:

```bash
fly logs
```

If there are any missing environment variables, the application logs will indicate the issue.
