# Next.js Concepts in Reel Matchmaker

This guide explains all the Next.js concepts used in this codebase to help you understand the "why" behind everything.

## 🏗️ App Router Architecture

Next.js 13+ uses the **App Router**, which is a file-system based router where folders define routes.

### File Structure

```
src/app/
├── layout.tsx          # Root layout (required)
├── page.tsx           # Home page (/)
├── movies/
│   ├── page.tsx       # Movies list page (/movies)
│   └── [id]/
│       └── page.tsx   # Dynamic movie page (/movies/123)
└── api/
    └── movies/
        └── route.ts   # API endpoint (/api/movies)
```

## 🧩 Server vs Client Components

### Server Components (Default)

- **No "use client" directive**
- Run on the server during build/request time
- Can directly fetch data, access databases, read files
- Cannot use hooks, event handlers, or browser APIs
- Better performance and SEO

**Example:**

```typescript
// This is a Server Component
export default async function HomePage() {
  const data = await fetchData(); // Runs on server
  return <div>{data.title}</div>;
}
```

### Client Components

- **Must have "use client" directive**
- Run in the browser
- Can use hooks, event handlers, browser APIs
- Can manage local state and side effects
- Interactive and dynamic

**Example:**

```typescript
"use client";
import { useState } from "react";

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## 📄 Layouts and Pages

### Root Layout (`layout.tsx`)

- **Required** in App Router
- Wraps ALL pages
- Defines basic HTML structure
- Can include global providers

### Pages (`page.tsx`)

- Define the content for a route
- Can be Server or Client Components
- Can export metadata and other Next.js functions

## 🔄 Data Fetching Patterns

### Server-Side Data Fetching

```typescript
// In Server Components
export default async function Page() {
  const data = await fetch("/api/data"); // Runs on server
  return <div>{data.title}</div>;
}
```

### Client-Side Data Fetching

```typescript
// In Client Components
"use client";
import { useQuery } from "@tanstack/react-query";

export default function Component() {
  const { data } = useQuery({ queryKey: ["data"], queryFn: fetchData });
  return <div>{data?.title}</div>;
}
```

## 🏷️ Metadata

### Static Metadata

```typescript
// In any page.tsx
export const metadata = {
  title: "My Page",
  description: "Page description",
};
```

### Dynamic Metadata

```typescript
// In dynamic pages
export async function generateMetadata({ params }) {
  const data = await fetchData(params.id);
  return {
    title: data.title,
    description: data.description,
  };
}
```

## 🔄 Rendering Strategies

### Static Site Generation (SSG)

- Pages are built at build time
- Fastest performance
- Good for content that doesn't change often

### Server-Side Rendering (SSR)

- Pages are rendered on each request
- Always fresh data
- Good for dynamic content

### Incremental Static Regeneration (ISR)

- Pages are built at build time but can be updated
- Best of both worlds
- Use `revalidate` export to control update frequency

```typescript
// Revalidate every 5 minutes
export const revalidate = 300;
```

## 🛣️ Dynamic Routes

### File-based Dynamic Routes

```
movies/[id]/page.tsx  // Handles /movies/123, /movies/456, etc.
```

### Accessing Parameters

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Use id to fetch data
}
```

## 🔌 API Routes

### Creating API Endpoints

```typescript
// app/api/movies/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Handle GET requests to /api/movies
  return NextResponse.json({ data: "movies" });
}

export async function POST(request: NextRequest) {
  // Handle POST requests to /api/movies
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

## 🎯 Key Next.js Features Used

### 1. Font Optimization

```typescript
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
```

### 2. Image Optimization

```typescript
import Image from "next/image";
<Image src="/image.jpg" alt="Description" width={500} height={300} />;
```

### 3. Error Handling

```typescript
import { notFound } from "next/navigation";

if (!data) {
  notFound(); // Shows 404 page
}
```

### 4. Loading States

```typescript
import { Suspense } from "react";

<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>;
```

## 🔧 Environment Variables

### Server-Side Only

```env
# .env.local
DATABASE_URL=...
API_KEY=...
```

### Client-Side Accessible

```env
# .env.local
NEXT_PUBLIC_API_URL=...
```

## 📦 Import Patterns

### Absolute Imports

```typescript
// Use @/ to import from src/
import { Component } from "@/components";
import { hook } from "@/hooks";
import { util } from "@/lib";
```

### Barrel Exports

```typescript
// components/index.ts
export * from "./Button";
export * from "./Card";
// Then import: import { Button, Card } from '@/components';
```

## 🎨 Styling

### CSS Modules

```typescript
import styles from './Component.module.css';
<div className={styles.container}>
```

### Tailwind CSS

```typescript
<div className="flex items-center justify-between p-4">
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🚀 Performance Optimizations

### 1. Server Components

- Reduce JavaScript bundle size
- Better SEO
- Faster initial page loads

### 2. Streaming

- Progressive loading with Suspense
- Better perceived performance

### 3. Caching

- React Query for client-side caching
- Next.js built-in caching for server components

### 4. Image Optimization

- Automatic image optimization
- Lazy loading
- Responsive images

## 🔍 Debugging Tips

### 1. Check Component Type

- Server Component: No "use client", can use async/await
- Client Component: Has "use client", can use hooks

### 2. Check Data Fetching

- Server: Direct fetch in component
- Client: Use React Query or useEffect

### 3. Check Error Boundaries

- Server: try/catch or notFound()
- Client: Error boundaries or error states

## 📚 Learning Resources

1. [Next.js Documentation](https://nextjs.org/docs)
2. [App Router Guide](https://nextjs.org/docs/app)
3. [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
4. [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

## 🎯 Best Practices

1. **Use Server Components by default**
2. **Only use Client Components when needed**
3. **Fetch data on the server when possible**
4. **Use proper error handling**
5. **Optimize images and fonts**
6. **Use TypeScript for better DX**
7. **Follow the file-based routing conventions**
8. **Use environment variables for configuration**
