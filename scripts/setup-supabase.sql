-- Supabase SQL Script for Pfand Tracker
-- Run this in your Supabase SQL Editor

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  bottles INTEGER,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Enable all operations for all users" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a view for statistics
CREATE OR REPLACE VIEW transaction_stats AS
SELECT 
  user_id,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'deposit' THEN amount ELSE -amount END) as current_balance,
  SUM(CASE WHEN type = 'deposit' THEN bottles ELSE -bottles END) as total_bottles,
  SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposited,
  SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawn
FROM transactions
GROUP BY user_id;
