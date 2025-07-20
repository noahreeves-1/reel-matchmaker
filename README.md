# Reel Matchmaker - AI Movie Recommendations

A lightweight movie recommendation web app that uses AI to suggest movies based on your ratings. Built with Next.js, TypeScript, and OpenAI.

## Features

- 🎬 Browse popular movies from TMDB
- ⭐ Rate movies (1-10 scale) saved to localStorage
- 🤖 AI-powered movie recommendations using Vercel AI SDK
- 📱 Fully responsive design
- ⚡ Fast performance with SSR, ISR, and Edge Functions

## Getting Started

### Prerequisites

You'll need API keys for:

- [TMDB API](https://www.themoviedb.org/settings/api) - for movie data
- [OpenAI API](https://platform.openai.com/api-keys) - for AI recommendations

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
TMDB_API_KEY=your_tmdb_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
