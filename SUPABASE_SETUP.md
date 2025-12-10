# Supabase Setup Guide for Pfand Tracker

This guide will help you set up Supabase integration for the Pfand Tracker application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - Name: `pfand-tracker` (or any name you prefer)
   - Database Password: (choose a strong password)
   - Region: (choose closest to your location)
4. Click "Create new project" and wait for setup to complete

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in the root of your project
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## Step 4: Run the SQL Script

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `scripts/setup-supabase.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the script

This will create:
- `transactions` table to store all bottle deposits and withdrawals
- Indexes for better query performance
- Row Level Security (RLS) policies
- A statistics view for analytics

## Step 5: Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `transactions` table with the following columns:
   - `id` (text, primary key)
   - `user_id` (text, nullable)
   - `date` (text)
   - `amount` (numeric)
   - `bottles` (integer, nullable)
   - `type` (text, must be 'deposit' or 'withdrawal')
   - `created_at` (timestamp)

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Add a bottle deposit
4. Check your Supabase dashboard → **Table Editor** → `transactions`
5. You should see the new transaction appear

## Features

### Automatic Sync
- All transactions are automatically synced to Supabase
- Local storage is used as a backup and for offline support

### Online/Offline Status
- Green "Synced" badge = connected to Supabase
- Gray "Offline" badge = using local storage only

### Data Persistence
- Data is stored in both Supabase (cloud) and localStorage (local)
- If Supabase is unavailable, the app continues to work with local data
- When connection is restored, you can manually sync by refreshing

## Optional: Secure Your Database

By default, the RLS policy allows all operations. To secure your data:

1. Remove the default policy in Supabase SQL Editor:
```sql
DROP POLICY "Enable all operations for all users" ON transactions;
```

2. Set up Supabase Auth (https://supabase.com/docs/guides/auth)

3. Create user-specific policies:
```sql
-- Allow users to read their own transactions
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own transactions
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE
  USING (auth.uid()::text = user_id);
```

## Troubleshooting

### "Offline" badge always showing
- Check that your `.env.local` file has the correct values
- Restart your development server after changing `.env.local`
- Check browser console for error messages
- Verify your Supabase project is active in the dashboard

### Transactions not appearing in Supabase
- Check the browser console for error messages
- Verify the SQL script ran successfully
- Check RLS policies aren't blocking inserts

### Data not loading on page refresh
- Clear your browser cache
- Check Supabase Table Editor to verify data exists
- Check browser console for errors

## Next Steps

- Set up Supabase Auth for multi-user support
- Create a statistics dashboard using the `transaction_stats` view
- Set up real-time subscriptions for live updates
- Deploy your app to production

## Support

For more information, visit:
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
