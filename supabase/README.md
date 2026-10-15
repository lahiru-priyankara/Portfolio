# Supabase Database Setup Guide

This guide explains how to connect and configure your Supabase PostgreSQL database for this portfolio.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Choose an organization, enter a name (e.g., `portfolio-db`), set a database password, and select your preferred region.
4. Click **"Create new project"** and wait for setup to complete (~2 minutes).

---

## 2. Run Database Schema & Seed Data

1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **"New Query"**.
3. Copy the entire contents of [`supabase/schema.sql`](./schema.sql) and paste it into the editor.
4. Click **"Run"** (or press `Ctrl+Enter`).
5. Verify in **Table Editor** that the following tables are created and seeded:
   - `profiles` (contains your personal information, headline, and bio)
   - `skills` (contains all categorized skills)
   - `projects` (contains your 5 portfolio projects)
   - `services` (contains your freelance service cards)
   - `messages` (inbox for contact submissions)

---

## 3. Create Admin Account for Dashboard Access

To access the portfolio Administration panel:
1. In the Supabase Dashboard, navigate to **Authentication** -> **Users**.
2. Click **"Add User"** -> **"Create user"**.
3. Enter your admin email and a strong password.
4. Set **Auto Confirm User?** to `true` (checked) so you can log in immediately.

---

## 4. Get Your API Credentials

1. In Supabase Dashboard, click on **Project Settings** (gear icon) -> **API**.
2. Note the following values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon / public key** (used for public read operations and frontend client)
   - **service_role key** (secret key used ONLY by the `server/` backend for full administrative access)

3. Add these credentials to your `server/.env` and your client `.env` as described in their respective guides.
