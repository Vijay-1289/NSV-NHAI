-- NSV Highway Monitoring Database Setup - Safe Migration
-- This script safely creates all necessary tables, policies, and functions
-- It handles existing objects gracefully without causing errors

-- 1. Create user_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('normal_user', 'highway_inspector', 'engineer')) NOT NULL DEFAULT 'normal_user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create highway_issues table (if not exists)
CREATE TABLE IF NOT EXISTS public.highway_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('reported', 'under_review', 'in_progress', 'resolved', 'closed')) DEFAULT 'reported',
    reported_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (safe - won't error if already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highway_issues ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies safely and recreate them
DO $$ 
BEGIN
    -- Drop user_profiles policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
        DROP POLICY "Users can view their own profile" ON public.user_profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
        DROP POLICY "Users can update their own profile" ON public.user_profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Allow insert for authenticated users') THEN
        DROP POLICY "Allow insert for authenticated users" ON public.user_profiles;
    END IF;
    
    -- Drop highway_issues policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'highway_issues' AND policyname = 'Users can view all issues') THEN
        DROP POLICY "Users can view all issues" ON public.highway_issues;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'highway_issues' AND policyname = 'Users can create issues') THEN
        DROP POLICY "Users can create issues" ON public.highway_issues;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'highway_issues' AND policyname = 'Inspectors and engineers can update issues') THEN
        DROP POLICY "Inspectors and engineers can update issues" ON public.highway_issues;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'highway_issues' AND policyname = 'Engineers can delete issues') THEN
        DROP POLICY "Engineers can delete issues" ON public.highway_issues;
    END IF;
END $$;

-- 5. Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Create policies for highway_issues
CREATE POLICY "Users can view all issues" ON public.highway_issues
    FOR SELECT USING (true);

CREATE POLICY "Users can create issues" ON public.highway_issues
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Inspectors and engineers can update issues" ON public.highway_issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('highway_inspector', 'engineer')
        )
    );

CREATE POLICY "Engineers can delete issues" ON public.highway_issues
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND role = 'engineer'
        )
    );

-- 7. Create function to handle new user registration (safe - will replace if exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'normal_user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for new user registration (safe - will replace if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Create function to update updated_at timestamp (safe - will replace if exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for updated_at (safe - will replace if exists)
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_highway_issues_updated_at ON public.highway_issues;
CREATE TRIGGER update_highway_issues_updated_at
    BEFORE UPDATE ON public.highway_issues
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Enable real-time for highway_issues (safe - won't error if already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'highway_issues'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.highway_issues;
    END IF;
END $$;

-- 12. Grant necessary permissions (safe - won't error if already granted)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.highway_issues TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 13. Create indexes for better performance (safe - won't error if already exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_highway_issues_status ON public.highway_issues(status);
CREATE INDEX IF NOT EXISTS idx_highway_issues_severity ON public.highway_issues(severity);
CREATE INDEX IF NOT EXISTS idx_highway_issues_reported_by ON public.highway_issues(reported_by);
CREATE INDEX IF NOT EXISTS idx_highway_issues_assigned_to ON public.highway_issues(assigned_to);

-- 14. Verify setup
SELECT 'Database setup completed successfully!' as status; 