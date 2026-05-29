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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          reason: string
          ref_id: string | null
          ref_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: string
          reason: string
          ref_id?: string | null
          ref_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          reason?: string
          ref_id?: string | null
          ref_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      custom_pages: {
        Row: {
          canonical_url: string | null
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured: boolean
          id: string
          layout: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          nofollow: boolean
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published_at: string | null
          schema_jsonld: Json | null
          sidebar_left: string
          sidebar_right: string
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          canonical_url?: string | null
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          layout?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nofollow?: boolean
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          schema_jsonld?: Json | null
          sidebar_left?: string
          sidebar_right?: string
          slug: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Update: {
          canonical_url?: string | null
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          layout?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          nofollow?: boolean
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          schema_jsonld?: Json | null
          sidebar_left?: string
          sidebar_right?: string
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
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
      mod_logs: {
        Row: {
          action: Database["public"]["Enums"]["mod_action"]
          actor_id: string
          created_at: string
          id: string
          payload: Json | null
          target_id: string | null
          target_type: string | null
          target_user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["mod_action"]
          actor_id: string
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["mod_action"]
          actor_id?: string
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      mod_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          note?: string
          user_id?: string
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
      page_redirects: {
        Row: {
          created_at: string
          from_slug: string
          id: string
          to_slug: string
        }
        Insert: {
          created_at?: string
          from_slug: string
          id?: string
          to_slug: string
        }
        Update: {
          created_at?: string
          from_slug?: string
          id?: string
          to_slug?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          comment_count: number
          created_at: string
          hashtags: string[]
          id: string
          is_anonymous: boolean
          kind: Database["public"]["Enums"]["post_kind"]
          media_urls: string[]
          owner_id: string
          poll: Json | null
          privacy: Database["public"]["Enums"]["post_privacy"]
          reaction_count: number
          slug: string
          text: string
          trending_score: number
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          comment_count?: number
          created_at?: string
          hashtags?: string[]
          id?: string
          is_anonymous?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          media_urls?: string[]
          owner_id: string
          poll?: Json | null
          privacy?: Database["public"]["Enums"]["post_privacy"]
          reaction_count?: number
          slug: string
          text?: string
          trending_score?: number
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          comment_count?: number
          created_at?: string
          hashtags?: string[]
          id?: string
          is_anonymous?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          media_urls?: string[]
          owner_id?: string
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
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
        }
        Relationships: []
      }
      room_moderators: {
        Row: {
          can_delete: boolean
          can_kick: boolean
          can_mute: boolean
          can_pin: boolean
          channel_id: string
          created_at: string
          created_by: string
          id: string
          user_id: string
        }
        Insert: {
          can_delete?: boolean
          can_kick?: boolean
          can_mute?: boolean
          can_pin?: boolean
          channel_id: string
          created_at?: string
          created_by: string
          id?: string
          user_id: string
        }
        Update: {
          can_delete?: boolean
          can_kick?: boolean
          can_mute?: boolean
          can_pin?: boolean
          channel_id?: string
          created_at?: string
          created_by?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          description: string | null
          keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_key: string
          title: string | null
          twitter_card: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_key: string
          title?: string | null
          twitter_card?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_key?: string
          title?: string | null
          twitter_card?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      url_rules: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          domain: string
          id: string
          kind: Database["public"]["Enums"]["url_rule_kind"]
          reason: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          domain: string
          id?: string
          kind: Database["public"]["Enums"]["url_rule_kind"]
          reason?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          domain?: string
          id?: string
          kind?: Database["public"]["Enums"]["url_rule_kind"]
          reason?: string | null
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          active: boolean
          ban_type: Database["public"]["Enums"]["ban_type"]
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          ip_address: unknown
          reason: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean
          ban_type?: Database["public"]["Enums"]["ban_type"]
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean
          ban_type?: Database["public"]["Enums"]["ban_type"]
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          acquired_at: string
          category: string
          equipped: boolean
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          category: string
          equipped?: boolean
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          category?: string
          equipped?: boolean
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mutes: {
        Row: {
          active: boolean
          channel_id: string | null
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          reason: string | null
          scope: Database["public"]["Enums"]["mute_scope"]
          user_id: string
        }
        Insert: {
          active?: boolean
          channel_id?: string | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          scope?: Database["public"]["Enums"]["mute_scope"]
          user_id: string
        }
        Update: {
          active?: boolean
          channel_id?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          scope?: Database["public"]["Enums"]["mute_scope"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      word_filters: {
        Row: {
          action: Database["public"]["Enums"]["word_filter_action"]
          active: boolean
          created_at: string
          created_by: string
          id: string
          match_mode: string
          pattern: string
          severity: number
        }
        Insert: {
          action?: Database["public"]["Enums"]["word_filter_action"]
          active?: boolean
          created_at?: string
          created_by: string
          id?: string
          match_mode?: string
          pattern: string
          severity?: number
        }
        Update: {
          action?: Database["public"]["Enums"]["word_filter_action"]
          active?: boolean
          created_at?: string
          created_by?: string
          id?: string
          match_mode?: string
          pattern?: string
          severity?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bump_page_view: { Args: { _slug: string }; Returns: undefined }
      has_friendship: { Args: { _a: string; _b: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_dm_channel_allowed: {
        Args: { _channel: string; _user: string }
        Returns: boolean
      }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      is_user_muted: {
        Args: { _channel: string; _user_id: string }
        Returns: boolean
      }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
      ban_type: "ban" | "temp_ban" | "shadow_ban" | "ip_ban"
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
      mod_action:
        | "ban"
        | "unban"
        | "temp_ban"
        | "shadow_ban"
        | "ip_ban"
        | "mute"
        | "unmute"
        | "kick"
        | "warn"
        | "delete_message"
        | "delete_post"
        | "pin_message"
        | "unpin_message"
        | "resolve_report"
        | "dismiss_report"
        | "note"
        | "add_word_filter"
        | "remove_word_filter"
        | "add_url_rule"
        | "remove_url_rule"
      mute_scope: "global" | "room"
      post_kind: "text" | "image" | "gif" | "poll"
      post_privacy: "public" | "friends" | "private"
      reaction_type: "like" | "love" | "haha" | "angry" | "fire"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      report_target: "message" | "post" | "user" | "room"
      url_rule_kind: "whitelist" | "block"
      word_filter_action: "delete" | "warn" | "mute" | "ban"
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
      app_role: ["super_admin", "admin", "moderator", "user"],
      ban_type: ["ban", "temp_ban", "shadow_ban", "ip_ban"],
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
      mod_action: [
        "ban",
        "unban",
        "temp_ban",
        "shadow_ban",
        "ip_ban",
        "mute",
        "unmute",
        "kick",
        "warn",
        "delete_message",
        "delete_post",
        "pin_message",
        "unpin_message",
        "resolve_report",
        "dismiss_report",
        "note",
        "add_word_filter",
        "remove_word_filter",
        "add_url_rule",
        "remove_url_rule",
      ],
      mute_scope: ["global", "room"],
      post_kind: ["text", "image", "gif", "poll"],
      post_privacy: ["public", "friends", "private"],
      reaction_type: ["like", "love", "haha", "angry", "fire"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      report_target: ["message", "post", "user", "room"],
      url_rule_kind: ["whitelist", "block"],
      word_filter_action: ["delete", "warn", "mute", "ban"],
    },
  },
} as const
