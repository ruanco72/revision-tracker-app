/**
 * Supabase Database Schemas
 * 
 * Run these SQL commands in your Supabase dashboard to create the necessary tables.
 */

-- ============================================================================
-- TABLE: user_profiles
-- Purpose: Store user profile data including streaks
-- ============================================================================
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX user_profiles_email_idx ON user_profiles(email);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view profiles for leaderboard"
  ON user_profiles
  FOR SELECT
  USING (true);

-- ============================================================================
-- TABLE: study_sessions
-- Purpose: Store individual study sessions with duration and timestamps
-- ============================================================================
CREATE TABLE public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_min FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX study_sessions_start_time_idx ON study_sessions(start_time);
CREATE INDEX study_sessions_user_time_idx ON study_sessions(user_id, start_time DESC);

-- Enable RLS on study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_sessions
CREATE POLICY "Users can view their own sessions"
  ON study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON study_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON study_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view sessions for leaderboard"
  ON study_sessions
  FOR SELECT
  USING (true);

-- ============================================================================
-- TRIGGER: Create user_profile on signup
-- Purpose: Automatically create a user profile when a new user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_user_profile();
