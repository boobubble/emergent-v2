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
      ai_chatbots: {
        Row: {
          allowed_rooms: string[]
          cooldown_sec: number
          created_at: string
          created_by: string | null
          description: string
          enabled: boolean
          id: string
          last_reply_at: string | null
          persona: string
          reply_chance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_rooms?: string[]
          cooldown_sec?: number
          created_at?: string
          created_by?: string | null
          description?: string
          enabled?: boolean
          id?: string
          last_reply_at?: string | null
          persona?: string
          reply_chance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_rooms?: string[]
          cooldown_sec?: number
          created_at?: string
          created_by?: string | null
          description?: string
          enabled?: boolean
          id?: string
          last_reply_at?: string | null
          persona?: string
          reply_chance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Relationships: []
      }
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
      assistant_user_prefs: {
        Row: {
          created_at: string
          disable_promo: boolean
          event_announced_id: string | null
          mission_daily_sent_on: string | null
          mission_weekly_sent_on: string | null
          muted: boolean
          reward_daily_sent_on: string | null
          security_checked_at: string | null
          updated_at: string
          user_id: string
          welcomed_at: string | null
        }
        Insert: {
          created_at?: string
          disable_promo?: boolean
          event_announced_id?: string | null
          mission_daily_sent_on?: string | null
          mission_weekly_sent_on?: string | null
          muted?: boolean
          reward_daily_sent_on?: string | null
          security_checked_at?: string | null
          updated_at?: string
          user_id: string
          welcomed_at?: string | null
        }
        Update: {
          created_at?: string
          disable_promo?: boolean
          event_announced_id?: string | null
          mission_daily_sent_on?: string | null
          mission_weekly_sent_on?: string | null
          muted?: boolean
          reward_daily_sent_on?: string | null
          security_checked_at?: string | null
          updated_at?: string
          user_id?: string
          welcomed_at?: string | null
        }
        Relationships: []
      }
      banned_devices: {
        Row: {
          created_at: string
          created_by: string
          fingerprint: string
          reason: string | null
          source_user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          fingerprint: string
          reason?: string | null
          source_user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          fingerprint?: string
          reason?: string | null
          source_user_id?: string | null
        }
        Relationships: []
      }
      broadcaster_settings: {
        Row: {
          disclaimer_enabled: boolean
          disclaimer_text: string
          id: number
          ticker_template: string
          updated_at: string
        }
        Insert: {
          disclaimer_enabled?: boolean
          disclaimer_text?: string
          id?: number
          ticker_template?: string
          updated_at?: string
        }
        Update: {
          disclaimer_enabled?: boolean
          disclaimer_text?: string
          id?: number
          ticker_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_themes: {
        Row: {
          accent_hex: string | null
          created_at: string
          description: string | null
          duration_days: number | null
          enabled: boolean
          id: string
          is_default: boolean
          name: string
          preview_url: string | null
          price_coins: number
          sort_order: number
          theme_key: string
          unlock_mode: string
          updated_at: string
        }
        Insert: {
          accent_hex?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name: string
          preview_url?: string | null
          price_coins?: number
          sort_order?: number
          theme_key: string
          unlock_mode?: string
          updated_at?: string
        }
        Update: {
          accent_hex?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          preview_url?: string | null
          price_coins?: number
          sort_order?: number
          theme_key?: string
          unlock_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatrooms: {
        Row: {
          age_restricted: boolean
          archived_at: string | null
          avatar_url: string | null
          background_image_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          member_count: number
          name: string
          owner_id: string
          password: string | null
          rules: string | null
          slug: string
          theme_color: string | null
          updated_at: string
          visibility: string
          welcome_message: string | null
        }
        Insert: {
          age_restricted?: boolean
          archived_at?: string | null
          avatar_url?: string | null
          background_image_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          member_count?: number
          name: string
          owner_id: string
          password?: string | null
          rules?: string | null
          slug: string
          theme_color?: string | null
          updated_at?: string
          visibility?: string
          welcome_message?: string | null
        }
        Update: {
          age_restricted?: boolean
          archived_at?: string | null
          avatar_url?: string | null
          background_image_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          member_count?: number
          name?: string
          owner_id?: string
          password?: string | null
          rules?: string | null
          slug?: string
          theme_color?: string | null
          updated_at?: string
          visibility?: string
          welcome_message?: string | null
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
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_awards: {
        Row: {
          awarded_at: string
          badge_label: string | null
          competition_id: string
          id: string
          participant_id: string | null
          place: number
          rewards: Json
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_label?: string | null
          competition_id: string
          id?: string
          participant_id?: string | null
          place: number
          rewards?: Json
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_label?: string | null
          competition_id?: string
          id?: string
          participant_id?: string | null
          place?: number
          rewards?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_awards_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_awards_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "competition_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_categories: {
        Row: {
          banner_url: string | null
          color: string | null
          created_at: string
          description: string | null
          enabled: boolean
          icon_url: string | null
          id: string
          is_default: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon_url?: string | null
          id?: string
          is_default?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon_url?: string | null
          id?: string
          is_default?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      competition_participants: {
        Row: {
          competition_id: string
          id: string
          joined_at: string
          rank: number | null
          status: string
          user_id: string
          vote_count: number
        }
        Insert: {
          competition_id: string
          id?: string
          joined_at?: string
          rank?: number | null
          status?: string
          user_id: string
          vote_count?: number
        }
        Update: {
          competition_id?: string
          id?: string
          joined_at?: string
          rank?: number | null
          status?: string
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_votes: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          participant_id: string
          voter_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          participant_id: string
          voter_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          participant_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_votes_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "competition_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          allow_vote_change: boolean
          announce_channels: string[]
          banner_url: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_at: string
          id: string
          max_participants: number | null
          name: string
          require_approval: boolean
          rewards: Json
          rules: string | null
          show_live_counts: boolean
          slug: string
          start_at: string
          status: string
          total_participants: number
          total_votes: number
          updated_at: string
          winner_count: number
        }
        Insert: {
          allow_vote_change?: boolean
          announce_channels?: string[]
          banner_url?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at: string
          id?: string
          max_participants?: number | null
          name: string
          require_approval?: boolean
          rewards?: Json
          rules?: string | null
          show_live_counts?: boolean
          slug: string
          start_at: string
          status?: string
          total_participants?: number
          total_votes?: number
          updated_at?: string
          winner_count?: number
        }
        Update: {
          allow_vote_change?: boolean
          announce_channels?: string[]
          banner_url?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string
          id?: string
          max_participants?: number | null
          name?: string
          require_approval?: boolean
          rewards?: Json
          rules?: string | null
          show_live_counts?: boolean
          slug?: string
          start_at?: string
          status?: string
          total_participants?: number
          total_votes?: number
          updated_at?: string
          winner_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "competitions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "competition_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      confession_reactions: {
        Row: {
          confession_id: string
          created_at: string
          id: string
          type: Database["public"]["Enums"]["confession_reaction_type"]
          user_id: string
        }
        Insert: {
          confession_id: string
          created_at?: string
          id?: string
          type: Database["public"]["Enums"]["confession_reaction_type"]
          user_id: string
        }
        Update: {
          confession_id?: string
          created_at?: string
          id?: string
          type?: Database["public"]["Enums"]["confession_reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "confession_reactions_confession_id_fkey"
            columns: ["confession_id"]
            isOneToOne: false
            referencedRelation: "confessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confession_reactions_confession_id_fkey"
            columns: ["confession_id"]
            isOneToOne: false
            referencedRelation: "confessions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      confession_replies: {
        Row: {
          alias: string | null
          author_id: string
          avatar_emoji: string | null
          confession_id: string
          created_at: string
          id: string
          is_anonymous: boolean
          text: string
        }
        Insert: {
          alias?: string | null
          author_id: string
          avatar_emoji?: string | null
          confession_id: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          text?: string
        }
        Update: {
          alias?: string | null
          author_id?: string
          avatar_emoji?: string | null
          confession_id?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "confession_replies_confession_id_fkey"
            columns: ["confession_id"]
            isOneToOne: false
            referencedRelation: "confessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confession_replies_confession_id_fkey"
            columns: ["confession_id"]
            isOneToOne: false
            referencedRelation: "confessions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      confessions: {
        Row: {
          alias: string | null
          author_id: string
          avatar_emoji: string | null
          category: string
          created_at: string
          display_mode: Database["public"]["Enums"]["confession_display_mode"]
          expires_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_pinned: boolean
          kind: Database["public"]["Enums"]["confession_kind"]
          like_count: number
          poll: Json | null
          reply_count: number
          status: Database["public"]["Enums"]["confession_status"]
          text: string
          updated_at: string
        }
        Insert: {
          alias?: string | null
          author_id: string
          avatar_emoji?: string | null
          category?: string
          created_at?: string
          display_mode?: Database["public"]["Enums"]["confession_display_mode"]
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_pinned?: boolean
          kind?: Database["public"]["Enums"]["confession_kind"]
          like_count?: number
          poll?: Json | null
          reply_count?: number
          status?: Database["public"]["Enums"]["confession_status"]
          text?: string
          updated_at?: string
        }
        Update: {
          alias?: string | null
          author_id?: string
          avatar_emoji?: string | null
          category?: string
          created_at?: string
          display_mode?: Database["public"]["Enums"]["confession_display_mode"]
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_pinned?: boolean
          kind?: Database["public"]["Enums"]["confession_kind"]
          like_count?: number
          poll?: Json | null
          reply_count?: number
          status?: Database["public"]["Enums"]["confession_status"]
          text?: string
          updated_at?: string
        }
        Relationships: []
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
          is_cornerstone: boolean
          layout: string
          link_priority: number
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
          is_cornerstone?: boolean
          layout?: string
          link_priority?: number
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
          is_cornerstone?: boolean
          layout?: string
          link_priority?: number
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
      daily_missions: {
        Row: {
          claimed: string[]
          day: string
          id: string
          progress: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed?: string[]
          day: string
          id?: string
          progress?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed?: string[]
          day?: string
          id?: string
          progress?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dj_broadcast_credentials: {
        Row: {
          dj_name: string | null
          host: string | null
          id: boolean
          listen_url: string | null
          mount: string | null
          notes: string | null
          port: number | null
          provider: string
          source_password: string | null
          source_username: string | null
          station_shortcode: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          dj_name?: string | null
          host?: string | null
          id?: boolean
          listen_url?: string | null
          mount?: string | null
          notes?: string | null
          port?: number | null
          provider?: string
          source_password?: string | null
          source_username?: string | null
          station_shortcode?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          dj_name?: string | null
          host?: string | null
          id?: boolean
          listen_url?: string | null
          mount?: string | null
          notes?: string | null
          port?: number | null
          provider?: string
          source_password?: string | null
          source_username?: string | null
          station_shortcode?: string | null
          updated_at?: string
          updated_by?: string | null
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
      feed_themes: {
        Row: {
          accent_hex: string | null
          created_at: string
          description: string | null
          duration_days: number | null
          enabled: boolean
          id: string
          is_default: boolean
          name: string
          preview_url: string | null
          price_coins: number
          sort_order: number
          theme_key: string
          unlock_mode: string
          updated_at: string
        }
        Insert: {
          accent_hex?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name: string
          preview_url?: string | null
          price_coins?: number
          sort_order?: number
          theme_key: string
          unlock_mode?: string
          updated_at?: string
        }
        Update: {
          accent_hex?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          preview_url?: string | null
          price_coins?: number
          sort_order?: number
          theme_key?: string
          unlock_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_comments: {
        Row: {
          author_id: string
          created_at: string
          id: string
          is_admin_response: boolean
          report_id: string
          text: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          is_admin_response?: boolean
          report_id: string
          text: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          is_admin_response?: boolean
          report_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "feedback_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_reports: {
        Row: {
          admin_note: string | null
          author_id: string
          category: Database["public"]["Enums"]["feedback_category"]
          comment_count: number
          created_at: string
          description: string
          device_info: Json | null
          duplicate_of: string | null
          id: string
          is_anonymous: boolean
          is_pinned: boolean
          is_showcased: boolean
          priority: Database["public"]["Enums"]["feedback_priority"]
          resolved_at: string | null
          resolved_by: string | null
          screenshots: string[]
          status: Database["public"]["Enums"]["feedback_status"]
          title: string
          updated_at: string
          upvote_count: number
          url: string | null
        }
        Insert: {
          admin_note?: string | null
          author_id: string
          category?: Database["public"]["Enums"]["feedback_category"]
          comment_count?: number
          created_at?: string
          description?: string
          device_info?: Json | null
          duplicate_of?: string | null
          id?: string
          is_anonymous?: boolean
          is_pinned?: boolean
          is_showcased?: boolean
          priority?: Database["public"]["Enums"]["feedback_priority"]
          resolved_at?: string | null
          resolved_by?: string | null
          screenshots?: string[]
          status?: Database["public"]["Enums"]["feedback_status"]
          title: string
          updated_at?: string
          upvote_count?: number
          url?: string | null
        }
        Update: {
          admin_note?: string | null
          author_id?: string
          category?: Database["public"]["Enums"]["feedback_category"]
          comment_count?: number
          created_at?: string
          description?: string
          device_info?: Json | null
          duplicate_of?: string | null
          id?: string
          is_anonymous?: boolean
          is_pinned?: boolean
          is_showcased?: boolean
          priority?: Database["public"]["Enums"]["feedback_priority"]
          resolved_at?: string | null
          resolved_by?: string | null
          screenshots?: string[]
          status?: Database["public"]["Enums"]["feedback_status"]
          title?: string
          updated_at?: string
          upvote_count?: number
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_reports_duplicate_of_fkey"
            columns: ["duplicate_of"]
            isOneToOne: false
            referencedRelation: "feedback_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_votes: {
        Row: {
          created_at: string
          id: string
          report_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_votes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "feedback_reports"
            referencedColumns: ["id"]
          },
        ]
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
      internal_link_clicks: {
        Row: {
          anchor_text: string | null
          created_at: string
          id: number
          source_url: string | null
          target_id: string | null
          target_url: string
          user_id: string | null
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string
          id?: number
          source_url?: string | null
          target_id?: string | null
          target_url: string
          user_id?: string | null
        }
        Update: {
          anchor_text?: string | null
          created_at?: string
          id?: number
          source_url?: string | null
          target_id?: string | null
          target_url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_link_clicks_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "internal_link_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_link_targets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_cornerstone: boolean
          keywords: string[]
          priority: number
          slug: string | null
          source_id: string | null
          source_table: string | null
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_cornerstone?: boolean
          keywords?: string[]
          priority?: number
          slug?: string | null
          source_id?: string | null
          source_table?: string | null
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_cornerstone?: boolean
          keywords?: string[]
          priority?: number
          slug?: string | null
          source_id?: string | null
          source_table?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      message_highlights: {
        Row: {
          buyer_id: string
          channel_id: string
          created_at: string
          expires_at: string
          id: string
          message_id: string
        }
        Insert: {
          buyer_id: string
          channel_id: string
          created_at?: string
          expires_at: string
          id?: string
          message_id: string
        }
        Update: {
          buyer_id?: string
          channel_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          message_id?: string
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
      post_boosts: {
        Row: {
          booster_id: string
          coins_spent: number
          created_at: string
          id: string
          post_id: string
          score_delta: number
        }
        Insert: {
          booster_id: string
          coins_spent: number
          created_at?: string
          id?: string
          post_id: string
          score_delta?: number
        }
        Update: {
          booster_id?: string
          coins_spent?: number
          created_at?: string
          id?: string
          post_id?: string
          score_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_boosts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_boosts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_safe"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "posts_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_owner_id_profiles_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_owner_id_profiles_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          anonymous: boolean
          id: string
          profile_owner_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          anonymous?: boolean
          id?: string
          profile_owner_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          anonymous?: boolean
          id?: string
          profile_owner_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          active_chat_theme: string | null
          active_feed_theme: string | null
          avatar_color: string
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          city: string | null
          coins: number
          country_code: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          hide_birth_year: boolean
          id: string
          interests: string[]
          is_bot: boolean
          is_official: boolean
          is_private: boolean
          last_active_day: string | null
          last_seen: string
          level: number
          longest_streak: number
          profile_completed: boolean
          profile_views_anonymous: boolean
          profile_views_enabled: boolean
          profile_views_friends_only: boolean
          profile_views_unlocked_full: boolean
          show_birthday: boolean
          show_country_flag: boolean
          show_gender: boolean
          show_guest_badge: boolean
          sound_prefs: Json
          status: string
          streak: number
          updated_at: string
          username: string
          xp: number
        }
        Insert: {
          about_me?: string | null
          active_chat_theme?: string | null
          active_feed_theme?: string | null
          avatar_color?: string
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          city?: string | null
          coins?: number
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          hide_birth_year?: boolean
          id: string
          interests?: string[]
          is_bot?: boolean
          is_official?: boolean
          is_private?: boolean
          last_active_day?: string | null
          last_seen?: string
          level?: number
          longest_streak?: number
          profile_completed?: boolean
          profile_views_anonymous?: boolean
          profile_views_enabled?: boolean
          profile_views_friends_only?: boolean
          profile_views_unlocked_full?: boolean
          show_birthday?: boolean
          show_country_flag?: boolean
          show_gender?: boolean
          show_guest_badge?: boolean
          sound_prefs?: Json
          status?: string
          streak?: number
          updated_at?: string
          username: string
          xp?: number
        }
        Update: {
          about_me?: string | null
          active_chat_theme?: string | null
          active_feed_theme?: string | null
          avatar_color?: string
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          city?: string | null
          coins?: number
          country_code?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          hide_birth_year?: boolean
          id?: string
          interests?: string[]
          is_bot?: boolean
          is_official?: boolean
          is_private?: boolean
          last_active_day?: string | null
          last_seen?: string
          level?: number
          longest_streak?: number
          profile_completed?: boolean
          profile_views_anonymous?: boolean
          profile_views_enabled?: boolean
          profile_views_friends_only?: boolean
          profile_views_unlocked_full?: boolean
          show_birthday?: boolean
          show_country_flag?: boolean
          show_gender?: boolean
          show_guest_badge?: boolean
          sound_prefs?: Json
          status?: string
          streak?: number
          updated_at?: string
          username?: string
          xp?: number
        }
        Relationships: []
      }
      radio_announcements: {
        Row: {
          active: boolean
          author_id: string
          body: string | null
          created_at: string
          ends_at: string | null
          id: string
          kind: string
          link: string | null
          pinned: boolean
          starts_at: string | null
          target: Json
          title: string
          updated_at: string
          widget_id: string | null
        }
        Insert: {
          active?: boolean
          author_id: string
          body?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          kind: string
          link?: string | null
          pinned?: boolean
          starts_at?: string | null
          target?: Json
          title: string
          updated_at?: string
          widget_id?: string | null
        }
        Update: {
          active?: boolean
          author_id?: string
          body?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          kind?: string
          link?: string | null
          pinned?: boolean
          starts_at?: string | null
          target?: Json
          title?: string
          updated_at?: string
          widget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radio_announcements_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "radio_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_queue_items: {
        Row: {
          added_by: string | null
          channel: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          played: boolean
          position: number
          thumbnail: string | null
          title: string | null
          widget_id: string
          youtube_id: string | null
          youtube_url: string
        }
        Insert: {
          added_by?: string | null
          channel?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          played?: boolean
          position?: number
          thumbnail?: string | null
          title?: string | null
          widget_id: string
          youtube_id?: string | null
          youtube_url: string
        }
        Update: {
          added_by?: string | null
          channel?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          played?: boolean
          position?: number
          thumbnail?: string | null
          title?: string | null
          widget_id?: string
          youtube_id?: string | null
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_queue_items_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "radio_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_schedules: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string
          host_id: string
          id: string
          starts_at: string
          status: Database["public"]["Enums"]["radio_schedule_status"]
          title: string
          updated_at: string
          widget_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at: string
          host_id: string
          id?: string
          starts_at: string
          status?: Database["public"]["Enums"]["radio_schedule_status"]
          title: string
          updated_at?: string
          widget_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string
          host_id?: string
          id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["radio_schedule_status"]
          title?: string
          updated_at?: string
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_schedules_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "radio_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_widget_state: {
        Row: {
          current_host_id: string | null
          current_show_title: string | null
          current_track_artist: string | null
          current_track_artwork: string | null
          current_track_title: string | null
          is_live: boolean
          listener_count: number
          mic_active: boolean
          peak_listeners_24h: number
          queue_size: number
          samples_24h: Json
          started_at: string | null
          updated_at: string
          widget_id: string
        }
        Insert: {
          current_host_id?: string | null
          current_show_title?: string | null
          current_track_artist?: string | null
          current_track_artwork?: string | null
          current_track_title?: string | null
          is_live?: boolean
          listener_count?: number
          mic_active?: boolean
          peak_listeners_24h?: number
          queue_size?: number
          samples_24h?: Json
          started_at?: string | null
          updated_at?: string
          widget_id: string
        }
        Update: {
          current_host_id?: string | null
          current_show_title?: string | null
          current_track_artist?: string | null
          current_track_artwork?: string | null
          current_track_title?: string | null
          is_live?: boolean
          listener_count?: number
          mic_active?: boolean
          peak_listeners_24h?: number
          queue_size?: number
          samples_24h?: Json
          started_at?: string | null
          updated_at?: string
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "radio_widget_state_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: true
            referencedRelation: "radio_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_widgets: {
        Row: {
          accent_color: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean
          id: string
          name: string
          owner_id: string | null
          slug: string
          stream_url: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          owner_id?: string | null
          slug: string
          stream_url?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string
          stream_url?: string | null
          updated_at?: string
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
      room_loyalty: {
        Row: {
          channel_id: string
          id: string
          last_active_day: string | null
          loyalty_level: number
          streak_days: number
          total_messages: number
          updated_at: string
          user_id: string
          week_start: string | null
          weekly_messages: number
        }
        Insert: {
          channel_id: string
          id?: string
          last_active_day?: string | null
          loyalty_level?: number
          streak_days?: number
          total_messages?: number
          updated_at?: string
          user_id: string
          week_start?: string | null
          weekly_messages?: number
        }
        Update: {
          channel_id?: string
          id?: string
          last_active_day?: string | null
          loyalty_level?: number
          streak_days?: number
          total_messages?: number
          updated_at?: string
          user_id?: string
          week_start?: string | null
          weekly_messages?: number
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
      subscription_payments: {
        Row: {
          admin_note: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          billing_cycle: string
          created_at: string
          currency_code: string
          id: string
          plan_id: string
          proof_reference: string | null
          provider: string
          provider_payment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          billing_cycle?: string
          created_at?: string
          currency_code?: string
          id?: string
          plan_id: string
          proof_reference?: string | null
          provider?: string
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          billing_cycle?: string
          created_at?: string
          currency_code?: string
          id?: string
          plan_id?: string
          proof_reference?: string | null
          provider?: string
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          currency_code: string
          currency_symbol: string
          description: string | null
          features: Json
          id: string
          is_default: boolean
          max_personal_chatrooms: number
          monthly_price: number
          name: string
          perks: Json
          slug: string
          sort_order: number
          tier: string
          trial_days: number
          updated_at: string
          yearly_price: number
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          currency_code?: string
          currency_symbol?: string
          description?: string | null
          features?: Json
          id?: string
          is_default?: boolean
          max_personal_chatrooms?: number
          monthly_price?: number
          name: string
          perks?: Json
          slug: string
          sort_order?: number
          tier?: string
          trial_days?: number
          updated_at?: string
          yearly_price?: number
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          currency_code?: string
          currency_symbol?: string
          description?: string | null
          features?: Json
          id?: string
          is_default?: boolean
          max_personal_chatrooms?: number
          monthly_price?: number
          name?: string
          perks?: Json
          slug?: string
          sort_order?: number
          tier?: string
          trial_days?: number
          updated_at?: string
          yearly_price?: number
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean
          author_id: string
          body: string
          created_at: string
          id: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          author_id: string
          body: string
          created_at?: string
          id?: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trio_room_members: {
        Row: {
          expires_at: string | null
          invited_at: string
          invited_by: string | null
          joined_at: string | null
          room_id: string
          status: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          room_id: string
          status?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          room_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trio_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "trio_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      trio_rooms: {
        Row: {
          closed_at: string | null
          closed_reason: string | null
          created_at: string
          hidden: boolean
          id: string
          name: string
          owner_id: string
          password: string | null
        }
        Insert: {
          closed_at?: string | null
          closed_reason?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          name: string
          owner_id: string
          password?: string | null
        }
        Update: {
          closed_at?: string | null
          closed_reason?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          name?: string
          owner_id?: string
          password?: string | null
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
      user_chat_themes: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          source: string
          theme_key: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: string
          theme_key: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: string
          theme_key?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_chat_themes_theme_key_fkey"
            columns: ["theme_key"]
            isOneToOne: false
            referencedRelation: "chat_themes"
            referencedColumns: ["theme_key"]
          },
        ]
      }
      user_devices: {
        Row: {
          fingerprint: string
          first_seen: string
          ip_address: unknown
          last_seen: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          fingerprint: string
          first_seen?: string
          ip_address?: unknown
          last_seen?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          fingerprint?: string
          first_seen?: string
          ip_address?: unknown
          last_seen?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feed_themes: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          source: string
          theme_key: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: string
          theme_key: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          source?: string
          theme_key?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feed_themes_theme_key_fkey"
            columns: ["theme_key"]
            isOneToOne: false
            referencedRelation: "feed_themes"
            referencedColumns: ["theme_key"]
          },
        ]
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
      user_phones: {
        Row: {
          created_at: string
          phone: string | null
          phone_verified: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          phone?: string | null
          phone_verified?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          phone?: string | null
          phone_verified?: boolean
          updated_at?: string
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
      user_subscriptions: {
        Row: {
          auto_renew: boolean
          billing_cycle: string
          cancelled_at: string | null
          created_at: string
          expiry_date: string | null
          id: string
          last_payment_id: string | null
          plan_id: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          last_payment_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          last_payment_id?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          created_at: string
          endpoint_id: string
          error: string | null
          event: string
          id: string
          ok: boolean
          payload: Json | null
          status_code: number | null
        }
        Insert: {
          created_at?: string
          endpoint_id: string
          error?: string | null
          event: string
          id?: string
          ok?: boolean
          payload?: Json | null
          status_code?: number | null
        }
        Update: {
          created_at?: string
          endpoint_id?: string
          error?: string | null
          event?: string
          id?: string
          ok?: boolean
          payload?: Json | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          id: string
          last_delivery_at: string | null
          last_status: number | null
          name: string
          secret_ciphertext: string | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          last_delivery_at?: string | null
          last_status?: number | null
          name: string
          secret_ciphertext?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          last_delivery_at?: string | null
          last_status?: number | null
          name?: string
          secret_ciphertext?: string | null
          updated_at?: string
          url?: string
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
      confession_replies_public: {
        Row: {
          alias: string | null
          author_id: string | null
          avatar_emoji: string | null
          confession_id: string | null
          created_at: string | null
          id: string | null
          is_anonymous: boolean | null
          text: string | null
        }
        Insert: {
          alias?: string | null
          author_id?: never
          avatar_emoji?: string | null
          confession_id?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          text?: string | null
        }
        Update: {
          alias?: string | null
          author_id?: never
          avatar_emoji?: string | null
          confession_id?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "confession_replies_confession_id_fkey"
            columns: ["confession_id"]
            isOneToOne: false
            referencedRelation: "confessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confession_replies_confession_id_fkey"
            columns: ["confession_id"]
            isOneToOne: false
            referencedRelation: "confessions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      confessions_public: {
        Row: {
          alias: string | null
          author_id: string | null
          avatar_emoji: string | null
          category: string | null
          created_at: string | null
          display_mode:
            | Database["public"]["Enums"]["confession_display_mode"]
            | null
          expires_at: string | null
          id: string | null
          image_url: string | null
          is_featured: boolean | null
          is_pinned: boolean | null
          kind: Database["public"]["Enums"]["confession_kind"] | null
          like_count: number | null
          poll: Json | null
          reply_count: number | null
          status: Database["public"]["Enums"]["confession_status"] | null
          text: string | null
          updated_at: string | null
        }
        Insert: {
          alias?: string | null
          author_id?: never
          avatar_emoji?: string | null
          category?: string | null
          created_at?: string | null
          display_mode?:
            | Database["public"]["Enums"]["confession_display_mode"]
            | null
          expires_at?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          kind?: Database["public"]["Enums"]["confession_kind"] | null
          like_count?: number | null
          poll?: Json | null
          reply_count?: number | null
          status?: Database["public"]["Enums"]["confession_status"] | null
          text?: string | null
          updated_at?: string | null
        }
        Update: {
          alias?: string | null
          author_id?: never
          avatar_emoji?: string | null
          category?: string | null
          created_at?: string | null
          display_mode?:
            | Database["public"]["Enums"]["confession_display_mode"]
            | null
          expires_at?: string | null
          id?: string | null
          image_url?: string | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          kind?: Database["public"]["Enums"]["confession_kind"] | null
          like_count?: number | null
          poll?: Json | null
          reply_count?: number | null
          status?: Database["public"]["Enums"]["confession_status"] | null
          text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      posts_safe: {
        Row: {
          author_id: string | null
          comment_count: number | null
          created_at: string | null
          hashtags: string[] | null
          id: string | null
          is_anonymous: boolean | null
          kind: Database["public"]["Enums"]["post_kind"] | null
          media_urls: string[] | null
          owner_id: string | null
          poll: Json | null
          privacy: Database["public"]["Enums"]["post_privacy"] | null
          reaction_count: number | null
          slug: string | null
          text: string | null
          trending_score: number | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          hashtags?: string[] | null
          id?: string | null
          is_anonymous?: boolean | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          media_urls?: string[] | null
          owner_id?: never
          poll?: Json | null
          privacy?: Database["public"]["Enums"]["post_privacy"] | null
          reaction_count?: number | null
          slug?: string | null
          text?: string | null
          trending_score?: number | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          hashtags?: string[] | null
          id?: string | null
          is_anonymous?: boolean | null
          kind?: Database["public"]["Enums"]["post_kind"] | null
          media_urls?: string[] | null
          owner_id?: never
          poll?: Json | null
          privacy?: Database["public"]["Enums"]["post_privacy"] | null
          reaction_count?: number | null
          slug?: string | null
          text?: string | null
          trending_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_profiles_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_directory: {
        Row: {
          about_me: string | null
          avatar_color: string | null
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          country_code: string | null
          gender: string | null
          hide_birth_year: boolean | null
          id: string | null
          is_bot: boolean | null
          is_official: boolean | null
          last_seen: string | null
          level: number | null
          longest_streak: number | null
          show_country_flag: boolean | null
          show_guest_badge: boolean | null
          status: string | null
          streak: number | null
          username: string | null
          xp: number | null
        }
        Insert: {
          about_me?: string | null
          avatar_color?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: never
          country_code?: never
          gender?: never
          hide_birth_year?: boolean | null
          id?: string | null
          is_bot?: boolean | null
          is_official?: boolean | null
          last_seen?: string | null
          level?: number | null
          longest_streak?: number | null
          show_country_flag?: boolean | null
          show_guest_badge?: boolean | null
          status?: string | null
          streak?: number | null
          username?: string | null
          xp?: number | null
        }
        Update: {
          about_me?: string | null
          avatar_color?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: never
          country_code?: never
          gender?: never
          hide_birth_year?: boolean | null
          id?: string | null
          is_bot?: boolean | null
          is_official?: boolean | null
          last_seen?: string | null
          level?: number | null
          longest_streak?: number | null
          show_country_flag?: boolean | null
          show_guest_badge?: boolean | null
          status?: string | null
          streak?: number | null
          username?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      user_bans_self: {
        Row: {
          active: boolean | null
          ban_type: Database["public"]["Enums"]["ban_type"] | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          ban_type?: Database["public"]["Enums"]["ban_type"] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          ban_type?: Database["public"]["Enums"]["ban_type"] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_trio_invite: {
        Args: { _password?: string; _room: string }
        Returns: undefined
      }
      activate_chat_theme: { Args: { _theme_key: string }; Returns: string }
      activate_feed_theme: { Args: { _theme_key: string }; Returns: string }
      admin_grant_chat_theme: {
        Args: { _days?: number; _theme_key: string; _user: string }
        Returns: {
          created_at: string
          expires_at: string | null
          id: string
          source: string
          theme_key: string
          unlocked_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_chat_themes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_grant_feed_theme: {
        Args: { _days?: number; _theme_key: string; _user: string }
        Returns: {
          created_at: string
          expires_at: string | null
          id: string
          source: string
          theme_key: string
          unlocked_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_feed_themes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_revoke_chat_theme: {
        Args: { _theme_key: string; _user: string }
        Returns: undefined
      }
      bootstrap_first_admin: { Args: never; Returns: undefined }
      bump_page_view: { Args: { _slug: string }; Returns: undefined }
      cast_competition_vote: {
        Args: { _competition: string; _participant: string }
        Returns: undefined
      }
      close_inactive_trio_rooms: { Args: never; Returns: undefined }
      complete_installation: { Args: { _payload: Json }; Returns: Json }
      create_trio_room: {
        Args: { _hidden?: boolean; _name: string; _password?: string }
        Returns: {
          closed_at: string | null
          closed_reason: string | null
          created_at: string
          hidden: boolean
          id: string
          name: string
          owner_id: string
          password: string | null
        }
        SetofOptions: {
          from: "*"
          to: "trio_rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_user_cascade: { Args: { _user: string }; Returns: undefined }
      get_active_chat_theme: { Args: { _user: string }; Returns: string }
      get_active_feed_theme: { Args: { _user: string }; Returns: string }
      get_chatroom_password: { Args: { _room: string }; Returns: string }
      get_install_status: { Args: never; Returns: Json }
      get_my_phone: {
        Args: never
        Returns: {
          phone: string
          phone_verified: boolean
        }[]
      }
      get_my_profile_visitors: {
        Args: { _limit?: number }
        Returns: {
          anonymous: boolean
          avatar_color: string
          avatar_url: string
          id: string
          locked: boolean
          username: string
          viewed_at: string
          viewer_id: string
        }[]
      }
      get_trio_room_password: { Args: { _room: string }; Returns: string }
      has_friendship: { Args: { _a: string; _b: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      installer_get_extras: { Args: never; Returns: Json }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_device_banned: { Args: { _fp: string }; Returns: boolean }
      is_dm_channel_allowed: {
        Args: { _channel: string; _user: string }
        Returns: boolean
      }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_trio_channel_allowed: {
        Args: { _channel: string; _user: string }
        Returns: boolean
      }
      is_trio_member: {
        Args: { _room: string; _user: string }
        Returns: boolean
      }
      is_trio_room_owner: {
        Args: { _room: string; _user: string }
        Returns: boolean
      }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      is_user_muted: {
        Args: { _channel: string; _user_id: string }
        Returns: boolean
      }
      my_active_plan: {
        Args: never
        Returns: {
          billing_cycle: string
          expiry_date: string
          max_personal_chatrooms: number
          name: string
          perks: Json
          plan_id: string
          slug: string
          status: string
          tier: string
        }[]
      }
      my_coin_balance: { Args: never; Returns: number }
      my_competition_vote: { Args: { _competition: string }; Returns: string }
      record_profile_view: { Args: { _owner_id: string }; Returns: undefined }
      reset_installation: { Args: never; Returns: undefined }
      slugify: { Args: { input: string }; Returns: string }
      trio_channel_room: { Args: { _channel: string }; Returns: string }
      unlock_chat_theme: {
        Args: { _theme_key: string }
        Returns: {
          created_at: string
          expires_at: string | null
          id: string
          source: string
          theme_key: string
          unlocked_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_chat_themes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      unlock_feed_theme: {
        Args: { _theme_key: string }
        Returns: {
          created_at: string
          expires_at: string | null
          id: string
          source: string
          theme_key: string
          unlocked_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_feed_themes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      unlock_profile_visitor_history: { Args: never; Returns: boolean }
      user_competition_achievements: {
        Args: { _user: string }
        Returns: {
          live_count: number
          total_joined: number
          total_wins: number
        }[]
      }
      verify_chatroom_password: {
        Args: { _password: string; _room: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user" | "dj" | "rj"
      ban_type: "ban" | "temp_ban" | "shadow_ban" | "ip_ban"
      confession_display_mode:
        | "fully_anonymous"
        | "random_id"
        | "random_avatar"
        | "username"
      confession_kind: "text" | "poll" | "image" | "question" | "advice"
      confession_reaction_type:
        | "like"
        | "funny"
        | "shock"
        | "sad"
        | "hot"
        | "love"
      confession_status: "pending" | "approved" | "rejected"
      feedback_category:
        | "bug"
        | "feature"
        | "ui"
        | "performance"
        | "security"
        | "other"
        | "improvement"
      feedback_priority: "low" | "normal" | "high" | "critical"
      feedback_status:
        | "open"
        | "investigating"
        | "planned"
        | "in_progress"
        | "fixed"
        | "closed"
        | "rejected"
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
        | "clear_channel"
      mute_scope: "global" | "room"
      post_kind: "text" | "image" | "gif" | "poll"
      post_privacy: "public" | "friends" | "private"
      radio_schedule_status: "scheduled" | "live" | "completed" | "cancelled"
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
      app_role: ["super_admin", "admin", "moderator", "user", "dj", "rj"],
      ban_type: ["ban", "temp_ban", "shadow_ban", "ip_ban"],
      confession_display_mode: [
        "fully_anonymous",
        "random_id",
        "random_avatar",
        "username",
      ],
      confession_kind: ["text", "poll", "image", "question", "advice"],
      confession_reaction_type: [
        "like",
        "funny",
        "shock",
        "sad",
        "hot",
        "love",
      ],
      confession_status: ["pending", "approved", "rejected"],
      feedback_category: [
        "bug",
        "feature",
        "ui",
        "performance",
        "security",
        "other",
        "improvement",
      ],
      feedback_priority: ["low", "normal", "high", "critical"],
      feedback_status: [
        "open",
        "investigating",
        "planned",
        "in_progress",
        "fixed",
        "closed",
        "rejected",
      ],
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
        "clear_channel",
      ],
      mute_scope: ["global", "room"],
      post_kind: ["text", "image", "gif", "poll"],
      post_privacy: ["public", "friends", "private"],
      radio_schedule_status: ["scheduled", "live", "completed", "cancelled"],
      reaction_type: ["like", "love", "haha", "angry", "fire"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      report_target: ["message", "post", "user", "room"],
      url_rule_kind: ["whitelist", "block"],
      word_filter_action: ["delete", "warn", "mute", "ban"],
    },
  },
} as const
