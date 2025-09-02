-- Migration 003: Chat System Implementation
-- This migration sets up the real-time chat infrastructure for the community hub

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    max_participants INTEGER DEFAULT 100,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'game', 'moderation')),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Room Participants Table
CREATE TABLE IF NOT EXISTS chat_room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT false,
    muted_until TIMESTAMP WITH TIME ZONE,
    muted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(room_id, user_id)
);

-- Insert default chat room (General)
INSERT INTO chat_rooms (id, name, description, is_private, created_by) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'General', 
    'Main community chat room for all members', 
    false, 
    NULL
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_room_id ON chat_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_participants_user_id ON chat_room_participants(user_id);

-- Row Level Security Policies

-- Chat Rooms: Anyone can view, only admins/mods can create/delete
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat rooms are viewable by everyone" ON chat_rooms
    FOR SELECT USING (true);

CREATE POLICY "Chat rooms can be created by admins and moderators" ON chat_rooms
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Chat Messages: Users can view messages in rooms they're in, send messages if not muted
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in rooms they're participants of" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_participants 
            WHERE room_id = chat_messages.room_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages if not muted" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        NOT EXISTS (
            SELECT 1 FROM chat_room_participants 
            WHERE room_id = chat_messages.room_id 
            AND user_id = auth.uid() 
            AND is_muted = true
        )
    );

CREATE POLICY "Users can edit their own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Chat Room Participants: Users can view participants, join/leave rooms
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in any room" ON chat_room_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON chat_room_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON chat_room_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user joining a chat room
CREATE OR REPLACE FUNCTION join_chat_room(room_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO chat_room_participants (room_id, user_id)
    VALUES (room_uuid, auth.uid())
    ON CONFLICT (room_id, user_id) 
    DO UPDATE SET 
        joined_at = NOW(),
        last_seen = NOW(),
        is_muted = false,
        muted_until = NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user leaving a chat room
CREATE OR REPLACE FUNCTION leave_chat_room(room_uuid UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM chat_room_participants 
    WHERE room_id = room_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
