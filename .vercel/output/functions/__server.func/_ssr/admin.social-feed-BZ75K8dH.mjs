import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useServerFn, Y as getAllSettings, aF as updateSetting, aJ as AdminPageHeader, B as Button, ac as Label, a0 as Input, ae as Card, af as CardContent, aG as AdminToggle, aK as useAdminSetting } from "./router-CYWPFaDK.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { S as Slider } from "./slider-By2jfzl6.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CwEa0x2C.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-sTNVlCXy.mjs";
import { F as FOCUS_COMPOSER_DEFAULTS } from "./focus-composer-config-C2kdKn7r.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "../_libs/i18next.mjs";
import "../_libs/i18next-browser-languagedetector+[...].mjs";
import "../_libs/i18next-chained-backend.mjs";
import "../_libs/i18next-localstorage-backend.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { a as Sparkles } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./client-H8IXbXWR.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./createSsrRpc-wK30bc3J.mjs";
import "./server-DxoLgaf4.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-B-ZvcUuj.mjs";
import "./env.server-Bcmcot3M.mjs";
import "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./feedback-config-DIeqYcnl.mjs";
import "./app-version-8YDb-xNu.mjs";
import "../_libs/i18next-http-backend.mjs";
import "./client.server-BXCYxJZY.mjs";
import "./sitemap-Dl8Aqg_O.mjs";
import "./reserved-routes-BWsWje6t.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "./mehfil-types-okfUX99d.mjs";
import "./feedbot-format-CFiGnWo6.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "../_libs/react-i18next.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/zod.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/radix-ui__react-slider.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
const DEFAULTS = {
  posts_per_load: 10,
  infinite_scroll: true,
  refresh_interval_sec: 30,
  autoplay_videos: false,
  autoplay_gifs: true,
  compact_mode: false,
  desktop_density: "comfortable",
  mobile_density: "cozy",
  feed_layout: "cards",
  weight_friends: 80,
  weight_trending: 60,
  weight_rooms: 40,
  weight_verified: 50,
  weight_newest: 70,
  weight_recommended: 50,
  stories_enabled: true,
  story_duration_sec: 5,
  story_image: true,
  story_video: true,
  story_text: true,
  story_daily_limit: 10,
  story_privacy: "public",
  story_reactions: true,
  story_analytics: true,
  post_text: true,
  post_image: true,
  post_video: true,
  post_gif: true,
  post_poll: true,
  post_feeling: true,
  post_room_share: true,
  post_hashtags: true,
  post_mentions: true,
  max_images_per_post: 4,
  max_video_mb: 50,
  max_hashtags: 10,
  post_char_limit: 2e3,
  nested_comments: true,
  gif_comments: true,
  emoji_comments: true,
  reactions_enabled: true,
  reaction_types: "like,love,haha,wow,sad,angry",
  comment_edit: true,
  comment_delete_minutes: 60,
  comment_cooldown_sec: 5,
  comment_flood_limit: 5,
  trending_hashtags: true,
  trending_posts: true,
  suggested_users: true,
  recommended_content: true,
  explore_public: true,
  viral_score_threshold: 100,
  engagement_weight: 70,
  allow_private_profiles: true,
  friends_only_posts: true,
  followers_system: false,
  profile_indexing: true,
  feed_public_visible: true,
  block_controls: true,
  restricted_accounts: true,
  profile_discoverable: true,
  promoted_posts_enabled: false,
  sponsored_cards: false,
  pinned_announcements: true,
  promoted_rooms: false,
  ad_frequency: 10,
  sponsored_label: "Sponsored",
  image_compression: true,
  video_compression: true,
  upload_quality: "high",
  cdn_enabled: true,
  lazy_loading: true,
  auto_thumbnails: true,
  media_optimization: true,
  cover_photo: true,
  profile_themes: false,
  profile_widgets: true,
  media_gallery: true,
  profile_badges: true,
  profile_completion: true,
  verified_badges: true,
  post_approval: false,
  auto_moderation: true,
  nsfw_filter: true,
  spam_detection: true,
  duplicate_detection: true,
  reports_queue: true,
  shadow_mod: false,
  hashtags_enabled: true,
  mentions_enabled: true,
  hashtag_analytics: true,
  hashtag_pages: true,
  seo_feed: true,
  seo_hashtags: true,
  seo_profiles: true,
  seo_posts: true,
  seo_stories: false,
  og_metadata: true,
  schema_markup: true,
  canonical_tags: true,
  feed_cache_sec: 30,
  polling_interval_sec: 15,
  websocket_limit: 1e3,
  media_preload: false
};
function SocialFeedSettings() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const {
    data
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings({})
  });
  const [v, setV] = reactExports.useState(DEFAULTS);
  reactExports.useEffect(() => {
    if (!data) return;
    const s = data.social_feed || {};
    setV({
      ...DEFAULTS,
      ...s
    });
  }, [data]);
  const mut = useMutation({
    mutationFn: () => saveSetting({
      data: {
        key: "social_feed",
        value: v
      }
    }),
    onSuccess: () => {
      toast.success("Social feed settings saved");
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "Failed to save")
  });
  const set = (k, val) => setV((s) => ({
    ...s,
    [k]: val
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPageHeader, { title: "Social Feed", description: "Advanced controls for the social feed, stories, posts, moderation, ads, SEO and performance.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending, children: mut.isPending ? "Saving…" : "Save changes" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "display", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "display", children: "Display" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "priority", children: "Priority" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "stories", children: "Stories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "posts", children: "Posts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comments", children: "Comments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "trending", children: "Trending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "privacy", children: "Privacy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ads", children: "Ads" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "media", children: "Media" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: "Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "moderation", children: "Moderation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "hashtags", children: "Hashtags" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "seo", children: "SEO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "performance", children: "Performance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "display", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Posts per load", value: v.posts_per_load, onChange: (n) => set("posts_per_load", n), min: 5, max: 50 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Refresh interval (seconds)", value: v.refresh_interval_sec, onChange: (n) => set("refresh_interval_sec", n), min: 5, max: 300 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid2, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectRow, { label: "Feed layout", value: v.feed_layout, onChange: (x) => set("feed_layout", x), options: [["cards", "Facebook-style cards"], ["compact", "Compact feed"], ["minimal", "Modern minimal"]] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectRow, { label: "Desktop density", value: v.desktop_density, onChange: (x) => set("desktop_density", x), options: [["comfortable", "Comfortable"], ["cozy", "Cozy"], ["compact", "Compact"]] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectRow, { label: "Mobile density", value: v.mobile_density, onChange: (x) => set("mobile_density", x), options: [["comfortable", "Comfortable"], ["cozy", "Cozy"], ["compact", "Compact"]] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Infinite scroll", value: v.infinite_scroll, onChange: (x) => set("infinite_scroll", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Autoplay videos", value: v.autoplay_videos, onChange: (x) => set("autoplay_videos", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Autoplay GIFs", value: v.autoplay_gifs, onChange: (x) => set("autoplay_gifs", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Compact feed mode", value: v.compact_mode, onChange: (x) => set("compact_mode", x) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "priority", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Higher weight = more prominence in the feed algorithm (0–100)." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Friends posts", value: v.weight_friends, onChange: (n) => set("weight_friends", n) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Trending posts", value: v.weight_trending, onChange: (n) => set("weight_trending", n) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Room shared posts", value: v.weight_rooms, onChange: (n) => set("weight_rooms", n) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Verified users", value: v.weight_verified, onChange: (n) => set("weight_verified", n) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Newest posts", value: v.weight_newest, onChange: (n) => set("weight_newest", n) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Recommended content", value: v.weight_recommended, onChange: (n) => set("weight_recommended", n) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "stories", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Stories enabled", value: v.stories_enabled, onChange: (x) => set("stories_enabled", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Image stories", value: v.story_image, onChange: (x) => set("story_image", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Video stories", value: v.story_video, onChange: (x) => set("story_video", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Text stories", value: v.story_text, onChange: (x) => set("story_text", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Story reactions", value: v.story_reactions, onChange: (x) => set("story_reactions", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Story analytics", value: v.story_analytics, onChange: (x) => set("story_analytics", x) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid2, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Story duration (sec)", value: v.story_duration_sec, onChange: (n) => set("story_duration_sec", n), min: 3, max: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Daily story limit", value: v.story_daily_limit, onChange: (n) => set("story_daily_limit", n), min: 1, max: 100 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectRow, { label: "Default privacy", value: v.story_privacy, onChange: (x) => set("story_privacy", x), options: [["public", "Public"], ["friends", "Friends"], ["private", "Private"]] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "posts", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Text posts", value: v.post_text, onChange: (x) => set("post_text", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Image posts", value: v.post_image, onChange: (x) => set("post_image", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Video posts", value: v.post_video, onChange: (x) => set("post_video", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "GIF posts", value: v.post_gif, onChange: (x) => set("post_gif", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Polls", value: v.post_poll, onChange: (x) => set("post_poll", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Feeling / activity", value: v.post_feeling, onChange: (x) => set("post_feeling", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Room sharing", value: v.post_room_share, onChange: (x) => set("post_room_share", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Hashtags", value: v.post_hashtags, onChange: (x) => set("post_hashtags", x) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Mentions", value: v.post_mentions, onChange: (x) => set("post_mentions", x) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Max images per post", value: v.max_images_per_post, onChange: (n) => set("max_images_per_post", n), min: 1, max: 20 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Max video size (MB)", value: v.max_video_mb, onChange: (n) => set("max_video_mb", n), min: 1, max: 500 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Max hashtags", value: v.max_hashtags, onChange: (n) => set("max_hashtags", n), min: 1, max: 50 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Post character limit", value: v.post_char_limit, onChange: (n) => set("post_char_limit", n), min: 100, max: 1e4 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FocusComposerCard, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comments", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Nested comments", value: v.nested_comments, onChange: (x) => set("nested_comments", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "GIF comments", value: v.gif_comments, onChange: (x) => set("gif_comments", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Emoji comments", value: v.emoji_comments, onChange: (x) => set("emoji_comments", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Reactions enabled", value: v.reactions_enabled, onChange: (x) => set("reactions_enabled", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Comment editing", value: v.comment_edit, onChange: (x) => set("comment_edit", x) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reaction types (comma-separated)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.reaction_types, onChange: (e) => set("reaction_types", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid2, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Delete window (minutes)", value: v.comment_delete_minutes, onChange: (n) => set("comment_delete_minutes", n), min: 0, max: 1440 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Comment cooldown (sec)", value: v.comment_cooldown_sec, onChange: (n) => set("comment_cooldown_sec", n), min: 0, max: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Flood limit (per min)", value: v.comment_flood_limit, onChange: (n) => set("comment_flood_limit", n), min: 1, max: 60 })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "trending", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Trending hashtags", value: v.trending_hashtags, onChange: (x) => set("trending_hashtags", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Trending posts", value: v.trending_posts, onChange: (x) => set("trending_posts", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Suggested users", value: v.suggested_users, onChange: (x) => set("suggested_users", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Recommended content", value: v.recommended_content, onChange: (x) => set("recommended_content", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Public explore page", value: v.explore_public, onChange: (x) => set("explore_public", x) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid2, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Viral score threshold", value: v.viral_score_threshold, onChange: (n) => set("viral_score_threshold", n), min: 10, max: 1e4 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SliderRow, { label: "Engagement scoring weight", value: v.engagement_weight, onChange: (n) => set("engagement_weight", n) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "privacy", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Allow private profiles", value: v.allow_private_profiles, onChange: (x) => set("allow_private_profiles", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Friends-only posts", value: v.friends_only_posts, onChange: (x) => set("friends_only_posts", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Followers system", value: v.followers_system, onChange: (x) => set("followers_system", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Profile indexing (SEO)", value: v.profile_indexing, onChange: (x) => set("profile_indexing", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Public feed visibility", value: v.feed_public_visible, onChange: (x) => set("feed_public_visible", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Block controls", value: v.block_controls, onChange: (x) => set("block_controls", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Restricted accounts", value: v.restricted_accounts, onChange: (x) => set("restricted_accounts", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Profile discoverability", value: v.profile_discoverable, onChange: (x) => set("profile_discoverable", x) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ads", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Promoted posts", value: v.promoted_posts_enabled, onChange: (x) => set("promoted_posts_enabled", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Sponsored feed cards", value: v.sponsored_cards, onChange: (x) => set("sponsored_cards", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Pinned announcements", value: v.pinned_announcements, onChange: (x) => set("pinned_announcements", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Promoted rooms", value: v.promoted_rooms, onChange: (x) => set("promoted_rooms", x) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid2, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Ad frequency (every N posts)", value: v.ad_frequency, onChange: (n) => set("ad_frequency", n), min: 3, max: 50 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sponsored label" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.sponsored_label, onChange: (e) => set("sponsored_label", e.target.value) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "media", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Image compression", value: v.image_compression, onChange: (x) => set("image_compression", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Video compression", value: v.video_compression, onChange: (x) => set("video_compression", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "CDN support", value: v.cdn_enabled, onChange: (x) => set("cdn_enabled", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Lazy loading", value: v.lazy_loading, onChange: (x) => set("lazy_loading", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Auto thumbnails", value: v.auto_thumbnails, onChange: (x) => set("auto_thumbnails", x) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Media optimization", value: v.media_optimization, onChange: (x) => set("media_optimization", x) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectRow, { label: "Upload quality", value: v.upload_quality, onChange: (x) => set("upload_quality", x), options: [["low", "Low"], ["medium", "Medium"], ["high", "High"], ["original", "Original"]] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Cover photo", value: v.cover_photo, onChange: (x) => set("cover_photo", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Profile themes", value: v.profile_themes, onChange: (x) => set("profile_themes", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Profile widgets", value: v.profile_widgets, onChange: (x) => set("profile_widgets", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Media gallery", value: v.media_gallery, onChange: (x) => set("media_gallery", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Profile badges", value: v.profile_badges, onChange: (x) => set("profile_badges", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Profile completion", value: v.profile_completion, onChange: (x) => set("profile_completion", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Verified badges", value: v.verified_badges, onChange: (x) => set("verified_badges", x) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "moderation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Post approval system", value: v.post_approval, onChange: (x) => set("post_approval", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Auto moderation", value: v.auto_moderation, onChange: (x) => set("auto_moderation", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "NSFW filtering", value: v.nsfw_filter, onChange: (x) => set("nsfw_filter", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Spam detection", value: v.spam_detection, onChange: (x) => set("spam_detection", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Duplicate detection", value: v.duplicate_detection, onChange: (x) => set("duplicate_detection", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Reports queue", value: v.reports_queue, onChange: (x) => set("reports_queue", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Shadow moderation", value: v.shadow_mod, onChange: (x) => set("shadow_mod", x) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hashtags", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Hashtags enabled", value: v.hashtags_enabled, onChange: (x) => set("hashtags_enabled", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Mentions enabled", value: v.mentions_enabled, onChange: (x) => set("mentions_enabled", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Hashtag analytics", value: v.hashtag_analytics, onChange: (x) => set("hashtag_analytics", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Clickable hashtag pages (/hashtag/xyz)", value: v.hashtag_pages, onChange: (x) => set("hashtag_pages", x) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "seo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ToggleGrid, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "SEO for feed pages", value: v.seo_feed, onChange: (x) => set("seo_feed", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "SEO for hashtag pages", value: v.seo_hashtags, onChange: (x) => set("seo_hashtags", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "SEO for profiles", value: v.seo_profiles, onChange: (x) => set("seo_profiles", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "SEO for public posts", value: v.seo_posts, onChange: (x) => set("seo_posts", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "SEO for stories", value: v.seo_stories, onChange: (x) => set("seo_stories", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Open Graph metadata", value: v.og_metadata, onChange: (x) => set("og_metadata", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Schema markup (JSON-LD)", value: v.schema_markup, onChange: (x) => set("schema_markup", x) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Canonical tags", value: v.canonical_tags, onChange: (x) => set("canonical_tags", x) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "performance", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionCard, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid2, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Feed cache (sec)", value: v.feed_cache_sec, onChange: (n) => set("feed_cache_sec", n), min: 0, max: 600 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Realtime polling (sec)", value: v.polling_interval_sec, onChange: (n) => set("polling_interval_sec", n), min: 5, max: 300 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NumRow, { label: "Websocket connection limit", value: v.websocket_limit, onChange: (n) => set("websocket_limit", n), min: 50, max: 5e4 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGrid, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Media preloading", value: v.media_preload, onChange: (x) => set("media_preload", x) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tuned for low-end Android devices, mobile bandwidth, and smooth scrolling." })
      ] }) })
    ] })
  ] });
}
function SectionCard({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-5 p-5", children }) });
}
function Grid2({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children });
}
function ToggleGrid({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children });
}
function Toggle({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 text-sm font-medium", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked: value, onCheckedChange: onChange })
  ] });
}
function NumRow({
  label,
  value,
  onChange,
  min,
  max
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min, max, value, onChange: (e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0))) })
  ] });
}
function SelectRow({
  label,
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value, onValueChange: onChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: options.map(([val, lbl]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: val, children: lbl }, val)) })
    ] })
  ] });
}
function SliderRow({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border border-border/60 bg-background p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm tabular-nums text-muted-foreground", children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Slider, { value: [value], min: 0, max: 100, step: 1, onValueChange: ([n]) => onChange(n) })
  ] });
}
function FocusComposerCard() {
  const {
    values,
    set,
    save,
    saving
  } = useAdminSetting("focus_composer", FOCUS_COMPOSER_DEFAULTS);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-border bg-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mt-0.5 h-5 w-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Focus / Spotlight Composer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Enhances the existing Feed Composer. When users click “What's on your mind?”, the composer expands into a spotlight overlay with dimmed background and elevated focus ring. Press ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded bg-muted px-1 py-0.5 text-[10px]", children: "Esc" }),
          " to close. The composer itself is not rewritten."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FocusRow, { label: "Enable Focus Composer", hint: "Click on the composer to open it in spotlight mode.", checked: values.enabled, onChange: (b) => set("enabled", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FocusRow, { label: "Enable background blur", hint: "Apply a backdrop blur behind the spotlight.", checked: values.blur, onChange: (b) => set("blur", b) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FocusRow, { label: "Enable composer animations", hint: "Use lightweight zoom-in / fade-in motion.", checked: values.animations, onChange: (b) => set("animations", b) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: save, disabled: saving, children: saving ? "Saving…" : "Save focus composer" }) })
  ] });
}
function FocusRow({
  label,
  hint,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: hint })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AdminToggle, { checked, onCheckedChange: onChange })
  ] });
}
export {
  SocialFeedSettings as component
};
