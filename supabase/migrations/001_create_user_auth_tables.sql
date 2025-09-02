-- Migration: Create User Authentication Tables
-- This migration sets up the foundation for the new user authentication system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table for extended profile data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    profile_picture_url TEXT,
    twitter_handle VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'moderator', 'game_host', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create games table for game management
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    banner_url VARCHAR(255),
    logo_url VARCHAR(255),
    description TEXT,
    requires_id BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_game_preferences table for game selections
CREATE TABLE IF NOT EXISTS user_game_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id VARCHAR(50) REFERENCES games(id) ON DELETE CASCADE,
    in_game_id VARCHAR(100),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- Create user_streaming_accounts table for Twitch/YouTube links
CREATE TABLE IF NOT EXISTS user_streaming_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitch', 'youtube')),
    account_id VARCHAR(100) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    last_stream_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Create chat_messages table for real-time chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'game')),
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_channels table for voice call management
CREATE TABLE IF NOT EXISTS voice_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_channel_participants table
CREATE TABLE IF NOT EXISTS voice_channel_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES voice_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(channel_id, user_id)
);

-- Add user_id column to existing player_identities table
ALTER TABLE player_identities 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id column to existing registrations table
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id column to existing leaderboard table
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id column to existing media_assets table
ALTER TABLE media_assets 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add user_id column to existing blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_preferences_user_id ON user_game_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaming_accounts_user_id ON user_streaming_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_channel_participants_channel_id ON voice_channel_participants(channel_id);
CREATE INDEX IF NOT EXISTS idx_voice_channel_participants_user_id ON voice_channel_participants(user_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaming_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_channel_participants ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies (admin only for management)
CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Allow users to view their own roles (so client-side code can read roles)
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- User game preferences policies
CREATE POLICY "Users can manage their own game preferences" ON user_game_preferences
    FOR ALL USING (auth.uid() = user_id);

-- User streaming accounts policies
CREATE POLICY "Users can manage their own streaming accounts" ON user_streaming_accounts
    FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies (all authenticated users can read/write)
CREATE POLICY "Authenticated users can read chat messages" ON chat_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Voice channels policies
CREATE POLICY "Authenticated users can view active voice channels" ON voice_channels
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Authenticated users can create voice channels" ON voice_channels
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Voice channel participants policies
CREATE POLICY "Users can view channel participants" ON voice_channel_participants
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join/leave channels" ON voice_channel_participants
    FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_game_preferences_updated_at
    BEFORE UPDATE ON user_game_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaming_accounts_updated_at
    BEFORE UPDATE ON user_streaming_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_channels_updated_at
    BEFORE UPDATE ON voice_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Populate games table with existing game data
INSERT INTO games (id, name, banner_url, logo_url, description, requires_id) VALUES
    ('4pics1word', '4 Pics 1 Word', '/games/4pics1word-banner.jpg', '/games/4pics1word.jpg', 'Word puzzles, quick thinking, and group laughs. Our cabal cracks the code!', false),
    ('amongus', 'Among Us', '/games/amongus-banner.jpg', '/games/amongus-logo.jpg', 'Deception, deduction, and hilarious betrayals. Trust no one!', false),
    ('scrabble', 'Scrabble', '/games/scrabble-banner.jpg', '/games/scrabble.jpg', 'Classic word battles. Where vocabulary meets victory.', true),
    ('poker', 'Poker', '/games/poker-banner.jpg', '/games/poker.jpg', 'Bluff, bet, and win big. Our cabal''s got the best poker faces.', false),
    ('codm', 'Call of Duty Mobile (CODM)', '/games/codm-banner.jpg', '/games/codm.png', 'Mobile FPS action. Fast reflexes, sharp aim, and squad tactics.', false),
    ('chess', 'Chess', '/games/chess-banner.jpg', '/games/chess.jpg', 'Strategic battles on the board. Every move counts.', true),
    ('geoguessr', 'GeoGuessr', '/games/geoguessr-banner.jpg', '/games/geoguessr.jpg', 'Explore the world through street view. Guess where you are!', false),
    ('discordgames', 'Discord Games', '/games/discord-banner.jpg', '/games/discord.jpg', 'Various mini-games and activities in Discord.', false),
    ('freefire', 'Free Fire', '/games/freefire-banner.jpg', '/games/freefire.jpg', 'Fast-paced battle royale. Quick thinking and sharp reflexes.', true),
    ('pubg', 'PUBG', '/games/pubg-banner.jpg', '/games/pubg.jpg', 'Battle royale action. Last one standing wins!', true),
    ('bloodstrike', 'Blood Strike', '/games/bloodstrike-banner.jpg', '/games/bloodstrike.jpg', 'Intense FPS combat. Precision and strategy.', true)
ON CONFLICT (id) DO NOTHING;
