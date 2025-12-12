# Vercel Deployment Note

## Important Information

This application is an **Electron desktop application** and **cannot be directly deployed to Vercel**.

Vercel is designed for:
- Web applications (React, Vue, Angular)
- Next.js applications
- Static websites
- Serverless functions

Electron applications are desktop applications that run on Windows, macOS, and Linux.

## Alternatives

### Option 1: Distribute as Desktop App
Build the executable and distribute it directly:
```bash
npm run package
```
The built app will be in the `release` folder.

### Option 2: Create a Web Version for Vercel

If you want to deploy to Vercel, you would need to create a separate web-based version:

1. **Frontend**: Create a Next.js or React app
2. **Backend**: Create API routes in Next.js or a separate Node.js server
3. **Scraping**: Move scraping logic to backend API

**Limitations of web version:**
- CORS issues when scraping from browser
- Need to implement backend API for scraping
- File downloads work differently in browsers
- Less control over browser environment

### Option 3: Deploy Backend API Only

You could deploy just the scraping API to Vercel:

1. Create a Next.js project
2. Add API routes for scraping
3. Keep the Electron GUI as desktop app
4. Have desktop app call your Vercel API

## Recommendation

For this use case (web scraping), a **desktop application is the best choice** because:
- Full control over the environment
- No CORS restrictions
- Direct file system access
- Better for automation tasks
- No server costs

If you specifically need a web version, I can help you create a separate Next.js project that can be deployed to Vercel.
