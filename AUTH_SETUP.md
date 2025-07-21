# Authentication Setup Guide

This guide will help you set up authentication for Reel Matchmaker using NextAuth.js with Google and GitHub OAuth providers.

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# OAuth Providers
# Google OAuth (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# TMDB API
TMDB_API_KEY="your-tmdb-api-key"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"
```

## Setting Up OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: "Reel Matchmaker"
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

### NextAuth Secret

Generate a secure random string for `NEXTAUTH_SECRET`:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use a secure random string generator
```

## How Authentication Works

### Public Access

- ✅ Browse movies on the home page
- ✅ Search for movies
- ✅ View movie details
- ✅ Access movie APIs

### Protected Features (Requires Login)

- 🔒 Rate movies
- 🔒 Add movies to want-to-watch list
- 🔒 Generate AI recommendations
- 🔒 Access personal movie lists
- 🔒 User-specific APIs

### User Flow

1. User visits the app and can browse movies freely
2. When they try to rate a movie or access protected features, they're redirected to `/login`
3. After successful authentication, they're redirected back to where they were
4. All user data is stored in the database with their user ID

## Testing

1. Start your development server: `pnpm dev`
2. Visit `http://localhost:3000`
3. Try to rate a movie - you should be redirected to the login page
4. Sign in with Google or GitHub
5. You should be redirected back and able to rate movies

## Production Deployment

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URIs to your OAuth providers
3. Set up your database with the schema
4. Deploy to Vercel or your preferred platform

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- Regularly rotate OAuth client secrets
- Monitor authentication logs for suspicious activity
