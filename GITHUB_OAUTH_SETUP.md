# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication for your application.

## Prerequisites

- A GitHub account
- Access to [GitHub Developer Settings](https://github.com/settings/developers)

## Setup Steps

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **OAuth Apps** in the left sidebar
3. Click **New OAuth App** (or **Register a new application**)
4. Fill in the application details:

   - **Application name**: Your app name (e.g., "Guide My AI")
   - **Homepage URL**: `http://localhost:3000` (for local development)
   - **Application description**: Optional description of your app
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

   > **Important**: The callback URL must be exactly `/api/auth/callback/github`

5. Click **Register application**

### 2. Get Your Credentials

After creating the app:

1. You'll see your **Client ID** on the app details page
2. Click **Generate a new client secret**
3. Copy both the **Client ID** and **Client Secret** immediately
   - ⚠️ The client secret will only be shown once!

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
# Application URL
APP_URL=http://localhost:3000

# Auth Secret (CHANGE THIS in production!)
AUTH_SECRET=your-random-secret-key-here

# GitHub OAuth Credentials
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
```

### 4. For GitHub Apps (Optional)

If you created a **GitHub App** instead of an **OAuth App**, you need one additional step:

1. Go to your app settings → **Permissions & events**
2. Under **Account permissions** → **Email addresses**
3. Select **Read-only**
4. Click **Save changes**

> **Note**: OAuth Apps don't need this step - only GitHub Apps do. If you get an "email_not_found" error, it means you're using a GitHub App and forgot this step!

### 5. Test the Integration

1. Start your development server:

   ```bash
   bun run dev
   ```

2. Navigate to: `http://localhost:3000/auth/login`

3. Click **Sign in with GitHub**

4. Authorize your application on GitHub

5. You should be redirected back to your app, logged in!

## Production Deployment

When deploying to production:

1. Go back to your GitHub OAuth App settings
2. Update the URLs:
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`
3. Update your environment variables:
   ```env
   APP_URL=https://your-domain.com
   AUTH_SECRET=a-secure-random-secret
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

> **Pro Tip**: You can create separate OAuth Apps for development and production

## Troubleshooting

### "The redirect_uri MUST match the registered callback URL for this application"

- Verify the callback URL in GitHub exactly matches your app's URL
- Check for:
  - Protocol mismatch (http vs https)
  - Port differences
  - Trailing slashes
  - Correct path: `/api/auth/callback/github`

### "email_not_found" Error

- You're using a GitHub App (not OAuth App)
- Go to **Permissions & events** → **Account permissions** → **Email addresses** → **Read-only**

### "Bad credentials" or "Invalid client"

- Double-check your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- Ensure there are no extra spaces in your `.env` file
- Make sure you copied the client secret when it was shown (it's only displayed once)

### User Profile Missing Email

Some GitHub users have their email set to private. You can handle this in several ways:

- Request the `user:email` scope (already included by default)
- Use the GitHub username as a fallback identifier
- Ask users to make their email public

## Database Schema

The existing database schema already includes an `account` table that supports social providers. No migration is needed!

## Additional Configuration Options

### Request Additional Scopes

To access more GitHub resources (repos, gists, etc.), add scopes in `src/auth.ts`:

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    scope: ["user:email", "read:user", "repo"],
  },
}
```

Common GitHub scopes:

- `user:email` - Access user email (default)
- `read:user` - Read user profile data (default)
- `repo` - Access repositories
- `gist` - Access gists
- `read:org` - Read organization membership

### GitHub Access Tokens

Unlike other providers, GitHub access tokens don't expire automatically:

- Tokens remain valid indefinitely unless revoked
- No refresh token is needed or provided
- Tokens are only invalidated if:
  - The user revokes access
  - The app revokes them
  - They go unused for 1 year

## Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub Provider](https://www.better-auth.com/docs/authentication/social)
- [GitHub OAuth Scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)

## Security Best Practices

1. **Never commit your `.env` file** - Add it to `.gitignore`
2. **Use different apps for dev/prod** - Easier to manage and more secure
3. **Rotate secrets periodically** - Generate new client secrets regularly
4. **Use HTTPS in production** - Required for secure token transmission
5. **Generate a strong `AUTH_SECRET`** - Use a random 32+ character string
