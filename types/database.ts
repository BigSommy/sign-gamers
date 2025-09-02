// Database types for Sign Gamers application
// These types match the database schema defined in our migrations

export interface Database {
  public: {
    Tables: {
      // User authentication and profile tables
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          bio: string | null;
          profile_picture_url: string | null;
          twitter_handle: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          bio?: string | null;
          profile_picture_url?: string | null;
          twitter_handle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          bio?: string | null;
          profile_picture_url?: string | null;
          twitter_handle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'moderator' | 'game_host' | 'user';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'moderator' | 'game_host' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'moderator' | 'game_host' | 'user';
          created_at?: string;
        };
      };
      user_game_preferences: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          in_game_id: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          in_game_id?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          in_game_id?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_streaming_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: 'twitch' | 'youtube';
          account_id: string;
          account_name: string;
          is_verified: boolean;
          last_stream_check: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: 'twitch' | 'youtube';
          account_id: string;
          account_name: string;
          is_verified?: boolean;
          last_stream_check?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: 'twitch' | 'youtube';
          account_id?: string;
          account_name?: string;
          is_verified?: boolean;
          last_stream_check?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Chat and communication tables
      chat_rooms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_private: boolean;
          max_participants: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_private?: boolean;
          max_participants?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_private?: boolean;
          max_participants?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          message: string;
          message_type: 'text' | 'system' | 'game' | 'moderation';
          is_edited: boolean;
          edited_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          message: string;
          message_type?: 'text' | 'system' | 'game' | 'moderation';
          is_edited?: boolean;
          edited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          message?: string;
          message_type?: 'text' | 'system' | 'game' | 'moderation';
          is_edited?: boolean;
          edited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_room_participants: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          joined_at: string;
          last_seen: string;
          is_muted: boolean;
          muted_until: string | null;
          muted_by: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          joined_at?: string;
          last_seen?: string;
          is_muted?: boolean;
          muted_until?: string | null;
          muted_by?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          joined_at?: string;
          last_seen?: string;
          is_muted?: boolean;
          muted_until?: string | null;
          muted_by?: string | null;
        };
      };
      voice_channels: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          is_active: boolean;
          max_participants: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          is_active?: boolean;
          max_participants?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string | null;
          is_active?: boolean;
          max_participants?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      voice_channel_participants: {
        Row: {
          id: string;
          channel_id: string;
          user_id: string;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          id?: string;
          channel_id: string;
          user_id: string;
          joined_at?: string;
          left_at?: string | null;
        };
        Update: {
          id?: string;
          channel_id?: string;
          user_id?: string;
          joined_at?: string;
          left_at?: string | null;
        };
      };
      // Existing tables with user_id added
      player_identities: {
        Row: {
          id: string;
          username: string;
          twitter: string | null;
          secret_code: string;
          user_id: string | null; // New field
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          twitter?: string | null;
          secret_code: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          twitter?: string | null;
          secret_code?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      tournaments: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'upcoming' | 'ongoing' | 'past';
          mode: string | null;
          room_code: string | null;
          banner_url: string | null;
          register_link: string | null;
          registration_deadline: string | null;
          game_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: 'upcoming' | 'ongoing' | 'past';
          mode?: string | null;
          room_code?: string | null;
          banner_url?: string | null;
          register_link?: string | null;
          registration_deadline?: string | null;
          game_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'upcoming' | 'ongoing' | 'past';
          mode?: string | null;
          room_code?: string | null;
          banner_url?: string | null;
          register_link?: string | null;
          registration_deadline?: string | null;
          game_id?: string;
          created_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          tournament_id: string;
          username: string;
          game_id: string;
          x_handle: string | null;
          user_id: string | null; // New field
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          username: string;
          game_id: string;
          x_handle?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          username?: string;
          game_id?: string;
          x_handle?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          tournament_id: string;
          username: string;
          score: number;
          x_handle: string | null;
          user_id: string | null; // New field
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          username: string;
          score: number;
          x_handle?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          username?: string;
          score?: number;
          x_handle?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
      };
      media_assets: {
        Row: {
          id: string;
          type: string;
          title: string;
          url: string;
          user_id: string | null; // New field
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          url: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          url?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          cover_url: string | null;
          user_id: string | null; // New field
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category: string;
          cover_url?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          cover_url?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          name: string;
          banner_url: string | null;
          logo_url: string | null;
          description: string | null;
          requires_id: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          banner_url?: string | null;
          logo_url?: string | null;
          description?: string | null;
          requires_id?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          banner_url?: string | null;
          logo_url?: string | null;
          description?: string | null;
          requires_id?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for common operations
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type UserGamePreference = Database['public']['Tables']['user_game_preferences']['Row'];
export type UserStreamingAccount = Database['public']['Tables']['user_streaming_accounts']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type VoiceChannel = Database['public']['Tables']['voice_channels']['Row'];
export type VoiceChannelParticipant = Database['public']['Tables']['voice_channel_participants']['Row'];
export type Tournament = Database['public']['Tables']['tournaments']['Row'];
export type Registration = Database['public']['Tables']['registrations']['Row'];
export type LeaderboardEntry = Database['public']['Tables']['leaderboard']['Row'];
export type MediaAsset = Database['public']['Tables']['media_assets']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];

// User roles enum
export type UserRoleType = 'admin' | 'moderator' | 'game_host' | 'user';

// Platform types for streaming
export type StreamingPlatform = 'twitch' | 'youtube';

// Message types for chat
export type MessageType = 'text' | 'system' | 'game';

// Tournament status types
export type TournamentStatus = 'upcoming' | 'ongoing' | 'past';
