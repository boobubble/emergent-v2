export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          text: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          text?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_reads: {
        Row: {
          channel_id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      game_invites: {
        Row: {
          created_at: string
          game_id: string
          id: string
          receiver_id: string
          responded_at: string | null
          sender_id: string
          status: Database["public"]["Enums"]["game_invite_status"]
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          receiver_id: string
          responded_at?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["game_invite_status"]
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          receiver_id?: string
          responded_at?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["game_invite_status"]
        }
        Relationships: [
          {
            foreignKeyName: "game_invites_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          color: string
          game_id: string
          id: string
          is_ready: boolean
          joined_at: string
          score: number
          seat: number
          user_id: string
        }
        Insert: {
          color: string
          game_id: string
          id?: string
          is_ready?: boolean
          joined_at?: string
          score?: number
          seat: number
          user_id: string
        }
        Update: {
          color?: string
          game_id?: string
          id?: string
          is_ready?: boolean
          joined_at?: string
          score?: number
          seat?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rewards: {
        Row: {
          coins: number
          created_at: string
          game_id: string | null
          id: string
          reward_type: Database["public"]["Enums"]["game_reward_type"]
          user_id: string
          xp: number
        }
        Insert: {
          coins?: number
          created_at?: string
          game_id?: string | null
          id?: string
          reward_type: Database["public"]["Enums"]["game_reward_type"]
          user_id: string
          xp?: number
        }
        Update: {
          coins?: number
          created_at?: string
          game_id?: string | null
          id?: string
          reward_type?: Database["public"]["Enums"]["game_reward_type"]
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_rewards_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          created_by: string
          current_turn_seat: number
          finished_at: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          started_at: string | null
          state: Json
          status: Database["public"]["Enums"]["game_status"]
          turn_count: number
          turn_started_at: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["game_visibility"]
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          current_turn_seat?: number
          finished_at?: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          started_at?: string | null
          state?: Json
          status?: Database["public"]["Enums"]["game_status"]
          turn_count?: number
          turn_started_at?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["game_visibility"]
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          current_turn_seat?: number
          finished_at?: string | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          started_at?: string | null
          state?: Json
          status?: Database["public"]["Enums"]["game_status"]
          turn_count?: number
          turn_started_at?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["game_visibility"]
          winner_id?: string | null
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          last_used_at: string
          tag: string
          usage_count: number
        }
        Insert: {
          last_used_at?: string
          tag: string
          usage_count?: number
        }
        Update: {
          last_used_at?: string
          tag?: string
          usage_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment: Json | null
          author_id: string
          channel_id: string
          created_at: string
          id: string
          kind: string
          reply_to_id: string | null
          text: string
        }
        Insert: {
          attachment?: Json | null
          author_id: string
          channel_id: string
          created_at?: string
          id?: string
          kind?: string
          reply_to_id?: string | null
          text?: string
        }
        Update: {
          attachment?: Json | null
          author_id?: string
          channel_id?: string
          created_at?: string
          id?: string
          kind?: string
          reply_to_id?: string | null
          text?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          kind: string
          payload: Json | null
          read: boolean
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          kind: string
          payload?: Json | null
          read?: boolean
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          payload?: Json | null
          read?: boolean
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          comment_count: number
          created_at: string
          hashtags: string[]
          id: string
          is_anonymous: boolean
          kind: Database["public"]["Enums"]["post_kind"]
          media_urls: string[]
          poll: Json | null
          privacy: Database["public"]["Enums"]["post_privacy"]
          reaction_count: number
          slug: string
          text: string
          trending_score: number
          updated_at: string
        }
        Insert: {
          author_id: string
          comment_count?: number
          created_at?: string
          hashtags?: string[]
          id?: string
          is_anonymous?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          media_urls?: string[]
          poll?: Json | null
          privacy?: Database["public"]["Enums"]["post_privacy"]
          reaction_count?: number
          slug: string
          text?: string
          trending_score?: number
          updated_at?: string
        }
        Update: {
          author_id?: string
          comment_count?: number
          created_at?: string
          hashtags?: string[]
          id?: string
          is_anonymous?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          media_urls?: string[]
          poll?: Json | null
          privacy?: Database["public"]["Enums"]["post_privacy"]
          reaction_count?: number
          slug?: string
          text?: string
          trending_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_color: string
          avatar_url: string | null
          bio: string | null
          coins: number
          cover_url: string | null
          created_at: string
          gender: string | null
          id: string
          is_private: boolean
          last_active_day: string | null
          last_seen: string
          level: number
          longest_streak: number
          status: string
          streak: number
          updated_at: string
          username: string
          xp: number
        }
        Insert: {
          avatar_color?: string
          avatar_url?: string | null
          bio?: string | null
          coins?: number
          cover_url?: string | null
          created_at?: string
          gender?: string | null
          id: string
          is_private?: boolean
          last_active_day?: string | null
          last_seen?: string
          level?: number
          longest_streak?: number
          status?: string
          streak?: number
          updated_at?: string
          username: string
          xp?: number
        }
        Update: {
          avatar_color?: string
          avatar_url?: string | null
          bio?: string | null
          coins?: number
          cover_url?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          is_private?: boolean
          last_active_day?: string | null
          last_seen?: string
          level?: number
          longest_streak?: number
          status?: string
          streak?: number
          updated_at?: string
          username?: string
          xp?: number
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_friendship: { Args: { _a: string; _b: string }; Returns: boolean }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      friendship_status: "pending" | "accepted" | "blocked"
      game_invite_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "cancelled"
        | "expired"
      game_reward_type: "win" | "participation" | "daily_first" | "streak_bonus"
      game_status: "waiting" | "active" | "finished" | "cancelled"
      game_type: "ludo_1v1" | "ludo_4p"
      game_visibility: "public" | "private"
      post_kind: "text" | "image" | "gif" | "poll"
      post_privacy: "public" | "friends" | "private"
      reaction_type: "like" | "love" | "haha" | "angry" | "fire"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      friendship_status: ["pending", "accepted", "blocked"],
      game_invite_status: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "expired",
      ],
      game_reward_type: ["win", "participation", "daily_first", "streak_bonus"],
      game_status: ["waiting", "active", "finished", "cancelled"],
      game_type: ["ludo_1v1", "ludo_4p"],
      game_visibility: ["public", "private"],
      post_kind: ["text", "image", "gif", "poll"],
      post_privacy: ["public", "friends", "private"],
      reaction_type: ["like", "love", "haha", "angry", "fire"],
    },
  },
} as const
