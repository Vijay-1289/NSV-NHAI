-- Migration: Create Highway Monitoring Tables
-- This migration creates the core tables for the NSV Highway Monitoring system

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'inspector', 'engineer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create highway_issues table
CREATE TABLE IF NOT EXISTS highway_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location NUMERIC[] NOT NULL CHECK (array_length(location, 1) = 2),
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'inspected', 'resolved')),
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_highway_issues_user_id ON highway_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_highway_issues_status ON highway_issues(status);
CREATE INDEX IF NOT EXISTS idx_highway_issues_created_at ON highway_issues(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE highway_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for highway_issues
DROP POLICY IF EXISTS "Users can view all highway issues" ON highway_issues;
DROP POLICY IF EXISTS "Users can insert their own issues" ON highway_issues;
DROP POLICY IF EXISTS "Inspectors and engineers can update issues" ON highway_issues;

CREATE POLICY "Users can view all highway issues" ON highway_issues
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own issues" ON highway_issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Inspectors and engineers can update issues" ON highway_issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('inspector', 'engineer')
    )
  );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_highway_issues_updated_at ON highway_issues;
CREATE TRIGGER update_highway_issues_updated_at
  BEFORE UPDATE ON highway_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable real-time for the tables (ignore if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Table already added to publication, ignore
      NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE highway_issues;
  EXCEPTION
    WHEN duplicate_object THEN
      -- Table already added to publication, ignore
      NULL;
  END;
END $$;

-- Insert sample data for testing (optional)
-- INSERT INTO user_profiles (id, email, role) VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'admin@nsv.com', 'engineer'),
--   ('00000000-0000-0000-0000-000000000002', 'inspector@nsv.com', 'inspector'),
--   ('00000000-0000-0000-0000-000000000003', 'user@nsv.com', 'user')
-- ON CONFLICT (id) DO NOTHING; 