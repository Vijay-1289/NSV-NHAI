-- Migration: Fix Highway Monitoring Tables
-- This migration safely sets up the database for NSV Highway Monitoring system
-- It handles existing objects gracefully and ensures everything is properly configured

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON user_profiles;

DROP POLICY IF EXISTS "Users can view all highway issues" ON highway_issues;
DROP POLICY IF EXISTS "Users can insert their own issues" ON highway_issues;
DROP POLICY IF EXISTS "Inspectors and engineers can update issues" ON highway_issues;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON highway_issues;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_highway_issues_updated_at ON highway_issues;

-- Create or replace functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_highway_issues_updated_at
  BEFORE UPDATE ON highway_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for highway_issues
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

-- Add tables to real-time publication (ignore if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE highway_issues;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_highway_issues_user_id ON highway_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_highway_issues_status ON highway_issues(status);
CREATE INDEX IF NOT EXISTS idx_highway_issues_created_at ON highway_issues(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Verify tables exist and have correct structure
DO $$
BEGIN
  -- Check if user_profiles table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    RAISE EXCEPTION 'user_profiles table does not exist. Please run the initial schema migration first.';
  END IF;
  
  -- Check if highway_issues table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'highway_issues') THEN
    RAISE EXCEPTION 'highway_issues table does not exist. Please run the initial schema migration first.';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully!';
END $$; 