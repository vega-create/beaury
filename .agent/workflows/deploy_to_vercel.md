---
description: How to deploy the Medical Clinic Booking app to Vercel
---

# Deploying to Vercel

Since your code is already on GitHub, deploying to Vercel is very straightforward.

## Prerequisites
- A [Vercel Account](https://vercel.com/signup)
- Your GitHub repository URL: `https://github.com/vega-create/beaury`

## Steps

1.  **Log in to Vercel**
    - Go to [vercel.com](https://vercel.com) and log in.

2.  **Import Project**
    - Click **"Add New..."** -> **"Project"**.
    - In the "Import Git Repository" section, find `vega-create/beaury` and click **"Import"**.

3.  **Configure Project**
    - **Framework Preset**: It should automatically detect `Next.js`.
    - **Root Directory**: `./` (default).
    - **Environment Variables**: **IMPORTANT!** You must add the Supabase keys here.
        - Expand the **"Environment Variables"** section.
        - Copy the values from your local `.env.local` file and add them:
            - `NEXT_PUBLIC_SUPABASE_URL`: (Your Supabase URL)
            - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)

4.  **Deploy**
    - Click **"Deploy"**.
    - Vercel will build your project. This usually takes 1-2 minutes.

5.  **Verify**
    - Once completed, you will get a production URL (e.g., `beaury.vercel.app`).
    - Visit the URL to verify the booking system is working.

## Troubleshooting
- **Build Failed?** Check the "Logs" tab in Vercel for error messages.
- **Database Connection Error?** Ensure your Supabase project is active and the Environment Variables are correct.
