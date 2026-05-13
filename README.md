# SUCCESS HR Candidate Apply

Standalone public candidate application frontend for SUCCESS HR Solution.

This app only contains the public advisor-code flow:

- `/` for advisor code entry
- `/:code` for a direct advisor application link
- `/apply` and `/apply/:code` are also supported

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set the backend API URL in `.env`:

```env
VITE_API_URL=https://your-backend-domain.com
```

Use this deployed app URL in the main admin/BA frontend:

```env
VITE_PUBLIC_APPLY_URL=https://your-candidate-apply.vercel.app
```

## Build

```bash
npm run build
```

Deploy the generated `dist` folder to Vercel, Netlify, S3, or any static host.

## Backend CORS

Add this app domain to the backend `CLIENT_URL` list:

```env
CLIENT_URL=https://admin.yourdomain.com,https://apply.yourdomain.com
```
