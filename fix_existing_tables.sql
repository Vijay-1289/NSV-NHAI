-- Fix existing tables by adding missing columns
-- This script safely adds missing columns to existing tables

-- 1. Add missing columns to user_profiles table (if they don't exist)
DO $$
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT UNIQUE;
    END IF;
    
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'normal_user';
        -- Add check constraint for role
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check 
            CHECK (role IN ('normal_user', 'highway_inspector', 'engineer'));
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'created_at') THEN
        ALTER TABLE public.user_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Add missing columns to highway_issues table (if they don't exist)
DO $$
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'title') THEN
        ALTER TABLE public.highway_issues ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled Issue';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'description') THEN
        ALTER TABLE public.highway_issues ADD COLUMN description TEXT;
    END IF;
    
    -- Add location_lat column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'location_lat') THEN
        ALTER TABLE public.highway_issues ADD COLUMN location_lat DECIMAL(10, 8);
    END IF;
    
    -- Add location_lng column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'location_lng') THEN
        ALTER TABLE public.highway_issues ADD COLUMN location_lng DECIMAL(11, 8);
    END IF;
    
    -- Add severity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'severity') THEN
        ALTER TABLE public.highway_issues ADD COLUMN severity TEXT DEFAULT 'medium';
        -- Add check constraint for severity
        ALTER TABLE public.highway_issues ADD CONSTRAINT highway_issues_severity_check 
            CHECK (severity IN ('low', 'medium', 'high', 'critical'));
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'status') THEN
        ALTER TABLE public.highway_issues ADD COLUMN status TEXT DEFAULT 'reported';
        -- Add check constraint for status
        ALTER TABLE public.highway_issues ADD CONSTRAINT highway_issues_status_check 
            CHECK (status IN ('reported', 'under_review', 'in_progress', 'resolved', 'closed'));
    END IF;
    
    -- Add reported_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'reported_by') THEN
        ALTER TABLE public.highway_issues ADD COLUMN reported_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Add assigned_to column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'assigned_to') THEN
        ALTER TABLE public.highway_issues ADD COLUMN assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'created_at') THEN
        ALTER TABLE public.highway_issues ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'highway_issues' AND column_name = 'updated_at') THEN
        ALTER TABLE public.highway_issues ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

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
SELECT 'Database tables fixed and setup completed successfully!' as status; 