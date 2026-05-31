import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllSettings, updateSetting } from "@/lib/admin.functions";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { FOCUS_COMPOSER_DEFAULTS, type FocusComposerConfig } from "@/lib/focus-composer-config";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/social-feed")({ component: SocialFeedSettings });

type FeedLayout = "cards" | "compact" | "minimal";
type FeedDensity = "comfortable" | "cozy" | "compact";

interface SocialFeedValues {
  // Display
  posts_per_load: number;
  infinite_scroll: boolean;
  refresh_interval_sec: number;
  autoplay_videos: boolean;
  autoplay_gifs: boolean;
  compact_mode: boolean;
  desktop_density: FeedDensity;
  mobile_density: FeedDensity;
  feed_layout: FeedLayout;

  // Priority weights (0-100)
  weight_friends: number;
  weight_trending: number;
  weight_rooms: number;
  weight_verified: number;
  weight_newest: number;
  weight_recommended: number;

  // Stories
  stories_enabled: boolean;
  story_duration_sec: number;
  story_image: boolean;
  story_video: boolean;
  story_text: boolean;
  story_daily_limit: number;
  story_privacy: "public" | "friends" | "private";
  story_reactions: boolean;
  story_analytics: boolean;

  // Post creation
  post_text: boolean;
  post_image: boolean;
  post_video: boolean;
  post_gif: boolean;
  post_poll: boolean;
  post_feeling: boolean;
  post_room_share: boolean;
  post_hashtags: boolean;
  post_mentions: boolean;
  max_images_per_post: number;
  max_video_mb: number;
  max_hashtags: number;
  post_char_limit: number;

  // Comments & reactions
  nested_comments: boolean;
  gif_comments: boolean;
  emoji_comments: boolean;
  reactions_enabled: boolean;
  reaction_types: string;
  comment_edit: boolean;
  comment_delete_minutes: number;
  comment_cooldown_sec: number;
  comment_flood_limit: number;

  // Trending & explore
  trending_hashtags: boolean;
  trending_posts: boolean;
  suggested_users: boolean;
  recommended_content: boolean;
  explore_public: boolean;
  viral_score_threshold: number;
  engagement_weight: number;

  // Privacy
  allow_private_profiles: boolean;
  friends_only_posts: boolean;
  followers_system: boolean;
  profile_indexing: boolean;
  feed_public_visible: boolean;
  block_controls: boolean;
  restricted_accounts: boolean;
  profile_discoverable: boolean;

  // Ads / promoted
  promoted_posts_enabled: boolean;
  sponsored_cards: boolean;
  pinned_announcements: boolean;
  promoted_rooms: boolean;
  ad_frequency: number; // every N posts
  sponsored_label: string;

  // Media
  image_compression: boolean;
  video_compression: boolean;
  upload_quality: "low" | "medium" | "high" | "original";
  cdn_enabled: boolean;
  lazy_loading: boolean;
  auto_thumbnails: boolean;
  media_optimization: boolean;

  // Profile
  cover_photo: boolean;
  profile_themes: boolean;
  profile_widgets: boolean;
  media_gallery: boolean;
  profile_badges: boolean;
  profile_completion: boolean;
  verified_badges: boolean;

  // Moderation
  post_approval: boolean;
  auto_moderation: boolean;
  nsfw_filter: boolean;
  spam_detection: boolean;
  duplicate_detection: boolean;
  reports_queue: boolean;
  shadow_mod: boolean;

  // Hashtags & mentions
  hashtags_enabled: boolean;
  mentions_enabled: boolean;
  hashtag_analytics: boolean;
  hashtag_pages: boolean;

  // SEO
  seo_feed: boolean;
  seo_hashtags: boolean;
  seo_profiles: boolean;
  seo_posts: boolean;
  seo_stories: boolean;
  og_metadata: boolean;
  schema_markup: boolean;
  canonical_tags: boolean;

  // Performance
  feed_cache_sec: number;
  polling_interval_sec: number;
  websocket_limit: number;
  media_preload: boolean;
}

const DEFAULTS: SocialFeedValues = {
  posts_per_load: 10, infinite_scroll: true, refresh_interval_sec: 30,
  autoplay_videos: false, autoplay_gifs: true, compact_mode: false,
  desktop_density: "comfortable", mobile_density: "cozy", feed_layout: "cards",

  weight_friends: 80, weight_trending: 60, weight_rooms: 40,
  weight_verified: 50, weight_newest: 70, weight_recommended: 50,

  stories_enabled: true, story_duration_sec: 5,
  story_image: true, story_video: true, story_text: true,
  story_daily_limit: 10, story_privacy: "public",
  story_reactions: true, story_analytics: true,

  post_text: true, post_image: true, post_video: true, post_gif: true,
  post_poll: true, post_feeling: true, post_room_share: true,
  post_hashtags: true, post_mentions: true,
  max_images_per_post: 4, max_video_mb: 50, max_hashtags: 10, post_char_limit: 2000,

  nested_comments: true, gif_comments: true, emoji_comments: true,
  reactions_enabled: true, reaction_types: "like,love,haha,wow,sad,angry",
  comment_edit: true, comment_delete_minutes: 60,
  comment_cooldown_sec: 5, comment_flood_limit: 5,

  trending_hashtags: true, trending_posts: true, suggested_users: true,
  recommended_content: true, explore_public: true,
  viral_score_threshold: 100, engagement_weight: 70,

  allow_private_profiles: true, friends_only_posts: true, followers_system: false,
  profile_indexing: true, feed_public_visible: true,
  block_controls: true, restricted_accounts: true, profile_discoverable: true,

  promoted_posts_enabled: false, sponsored_cards: false,
  pinned_announcements: true, promoted_rooms: false,
  ad_frequency: 10, sponsored_label: "Sponsored",

  image_compression: true, video_compression: true, upload_quality: "high",
  cdn_enabled: true, lazy_loading: true,
  auto_thumbnails: true, media_optimization: true,

  cover_photo: true, profile_themes: false, profile_widgets: true,
  media_gallery: true, profile_badges: true,
  profile_completion: true, verified_badges: true,

  post_approval: false, auto_moderation: true, nsfw_filter: true,
  spam_detection: true, duplicate_detection: true,
  reports_queue: true, shadow_mod: false,

  hashtags_enabled: true, mentions_enabled: true,
  hashtag_analytics: true, hashtag_pages: true,

  seo_feed: true, seo_hashtags: true, seo_profiles: true,
  seo_posts: true, seo_stories: false,
  og_metadata: true, schema_markup: true, canonical_tags: true,

  feed_cache_sec: 30, polling_interval_sec: 15,
  websocket_limit: 1000, media_preload: false,
};

function SocialFeedSettings() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => fetchSettings({}) });
  const [v, setV] = useState<SocialFeedValues>(DEFAULTS);

  useEffect(() => {
    if (!data) return;
    const s = (data.social_feed as Partial<SocialFeedValues>) || {};
    setV({ ...DEFAULTS, ...s });
  }, [data]);

  const mut = useMutation({
    mutationFn: () => saveSetting({ data: { key: "social_feed", value: v } }),
    onSuccess: () => { toast.success("Social feed settings saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const set = <K extends keyof SocialFeedValues>(k: K, val: SocialFeedValues[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  return (
    <div>
      <AdminPageHeader
        title="Social Feed"
        description="Advanced controls for the social feed, stories, posts, moderation, ads, SEO and performance."
        actions={<Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving…" : "Save changes"}</Button>}
      />

      <Tabs defaultValue="display" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="display">
          <SectionCard>
            <NumRow label="Posts per load" value={v.posts_per_load} onChange={(n) => set("posts_per_load", n)} min={5} max={50} />
            <NumRow label="Refresh interval (seconds)" value={v.refresh_interval_sec} onChange={(n) => set("refresh_interval_sec", n)} min={5} max={300} />
            <Grid2>
              <SelectRow label="Feed layout" value={v.feed_layout} onChange={(x) => set("feed_layout", x as FeedLayout)}
                options={[["cards","Facebook-style cards"],["compact","Compact feed"],["minimal","Modern minimal"]]} />
              <SelectRow label="Desktop density" value={v.desktop_density} onChange={(x) => set("desktop_density", x as FeedDensity)}
                options={[["comfortable","Comfortable"],["cozy","Cozy"],["compact","Compact"]]} />
              <SelectRow label="Mobile density" value={v.mobile_density} onChange={(x) => set("mobile_density", x as FeedDensity)}
                options={[["comfortable","Comfortable"],["cozy","Cozy"],["compact","Compact"]]} />
            </Grid2>
            <ToggleGrid>
              <Toggle label="Infinite scroll" value={v.infinite_scroll} onChange={(x) => set("infinite_scroll", x)} />
              <Toggle label="Autoplay videos" value={v.autoplay_videos} onChange={(x) => set("autoplay_videos", x)} />
              <Toggle label="Autoplay GIFs" value={v.autoplay_gifs} onChange={(x) => set("autoplay_gifs", x)} />
              <Toggle label="Compact feed mode" value={v.compact_mode} onChange={(x) => set("compact_mode", x)} />
            </ToggleGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="priority">
          <SectionCard>
            <p className="text-xs text-muted-foreground">Higher weight = more prominence in the feed algorithm (0–100).</p>
            <SliderRow label="Friends posts" value={v.weight_friends} onChange={(n) => set("weight_friends", n)} />
            <SliderRow label="Trending posts" value={v.weight_trending} onChange={(n) => set("weight_trending", n)} />
            <SliderRow label="Room shared posts" value={v.weight_rooms} onChange={(n) => set("weight_rooms", n)} />
            <SliderRow label="Verified users" value={v.weight_verified} onChange={(n) => set("weight_verified", n)} />
            <SliderRow label="Newest posts" value={v.weight_newest} onChange={(n) => set("weight_newest", n)} />
            <SliderRow label="Recommended content" value={v.weight_recommended} onChange={(n) => set("weight_recommended", n)} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="stories">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Stories enabled" value={v.stories_enabled} onChange={(x) => set("stories_enabled", x)} />
              <Toggle label="Image stories" value={v.story_image} onChange={(x) => set("story_image", x)} />
              <Toggle label="Video stories" value={v.story_video} onChange={(x) => set("story_video", x)} />
              <Toggle label="Text stories" value={v.story_text} onChange={(x) => set("story_text", x)} />
              <Toggle label="Story reactions" value={v.story_reactions} onChange={(x) => set("story_reactions", x)} />
              <Toggle label="Story analytics" value={v.story_analytics} onChange={(x) => set("story_analytics", x)} />
            </ToggleGrid>
            <Grid2>
              <NumRow label="Story duration (sec)" value={v.story_duration_sec} onChange={(n) => set("story_duration_sec", n)} min={3} max={60} />
              <NumRow label="Daily story limit" value={v.story_daily_limit} onChange={(n) => set("story_daily_limit", n)} min={1} max={100} />
              <SelectRow label="Default privacy" value={v.story_privacy} onChange={(x) => set("story_privacy", x as any)}
                options={[["public","Public"],["friends","Friends"],["private","Private"]]} />
            </Grid2>
          </SectionCard>
        </TabsContent>

        <TabsContent value="posts">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Text posts" value={v.post_text} onChange={(x) => set("post_text", x)} />
              <Toggle label="Image posts" value={v.post_image} onChange={(x) => set("post_image", x)} />
              <Toggle label="Video posts" value={v.post_video} onChange={(x) => set("post_video", x)} />
              <Toggle label="GIF posts" value={v.post_gif} onChange={(x) => set("post_gif", x)} />
              <Toggle label="Polls" value={v.post_poll} onChange={(x) => set("post_poll", x)} />
              <Toggle label="Feeling / activity" value={v.post_feeling} onChange={(x) => set("post_feeling", x)} />
              <Toggle label="Room sharing" value={v.post_room_share} onChange={(x) => set("post_room_share", x)} />
              <Toggle label="Hashtags" value={v.post_hashtags} onChange={(x) => set("post_hashtags", x)} />
              <Toggle label="Mentions" value={v.post_mentions} onChange={(x) => set("post_mentions", x)} />
            </ToggleGrid>
            <Grid2>
              <NumRow label="Max images per post" value={v.max_images_per_post} onChange={(n) => set("max_images_per_post", n)} min={1} max={20} />
              <NumRow label="Max video size (MB)" value={v.max_video_mb} onChange={(n) => set("max_video_mb", n)} min={1} max={500} />
              <NumRow label="Max hashtags" value={v.max_hashtags} onChange={(n) => set("max_hashtags", n)} min={1} max={50} />
              <NumRow label="Post character limit" value={v.post_char_limit} onChange={(n) => set("post_char_limit", n)} min={100} max={10000} />
            </Grid2>
          </SectionCard>
          <FocusComposerCard />
        </TabsContent>

        <TabsContent value="comments">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Nested comments" value={v.nested_comments} onChange={(x) => set("nested_comments", x)} />
              <Toggle label="GIF comments" value={v.gif_comments} onChange={(x) => set("gif_comments", x)} />
              <Toggle label="Emoji comments" value={v.emoji_comments} onChange={(x) => set("emoji_comments", x)} />
              <Toggle label="Reactions enabled" value={v.reactions_enabled} onChange={(x) => set("reactions_enabled", x)} />
              <Toggle label="Comment editing" value={v.comment_edit} onChange={(x) => set("comment_edit", x)} />
            </ToggleGrid>
            <div className="space-y-1.5">
              <Label>Reaction types (comma-separated)</Label>
              <Input value={v.reaction_types} onChange={(e) => set("reaction_types", e.target.value)} />
            </div>
            <Grid2>
              <NumRow label="Delete window (minutes)" value={v.comment_delete_minutes} onChange={(n) => set("comment_delete_minutes", n)} min={0} max={1440} />
              <NumRow label="Comment cooldown (sec)" value={v.comment_cooldown_sec} onChange={(n) => set("comment_cooldown_sec", n)} min={0} max={60} />
              <NumRow label="Flood limit (per min)" value={v.comment_flood_limit} onChange={(n) => set("comment_flood_limit", n)} min={1} max={60} />
            </Grid2>
          </SectionCard>
        </TabsContent>

        <TabsContent value="trending">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Trending hashtags" value={v.trending_hashtags} onChange={(x) => set("trending_hashtags", x)} />
              <Toggle label="Trending posts" value={v.trending_posts} onChange={(x) => set("trending_posts", x)} />
              <Toggle label="Suggested users" value={v.suggested_users} onChange={(x) => set("suggested_users", x)} />
              <Toggle label="Recommended content" value={v.recommended_content} onChange={(x) => set("recommended_content", x)} />
              <Toggle label="Public explore page" value={v.explore_public} onChange={(x) => set("explore_public", x)} />
            </ToggleGrid>
            <Grid2>
              <NumRow label="Viral score threshold" value={v.viral_score_threshold} onChange={(n) => set("viral_score_threshold", n)} min={10} max={10000} />
              <SliderRow label="Engagement scoring weight" value={v.engagement_weight} onChange={(n) => set("engagement_weight", n)} />
            </Grid2>
          </SectionCard>
        </TabsContent>

        <TabsContent value="privacy">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Allow private profiles" value={v.allow_private_profiles} onChange={(x) => set("allow_private_profiles", x)} />
              <Toggle label="Friends-only posts" value={v.friends_only_posts} onChange={(x) => set("friends_only_posts", x)} />
              <Toggle label="Followers system" value={v.followers_system} onChange={(x) => set("followers_system", x)} />
              <Toggle label="Profile indexing (SEO)" value={v.profile_indexing} onChange={(x) => set("profile_indexing", x)} />
              <Toggle label="Public feed visibility" value={v.feed_public_visible} onChange={(x) => set("feed_public_visible", x)} />
              <Toggle label="Block controls" value={v.block_controls} onChange={(x) => set("block_controls", x)} />
              <Toggle label="Restricted accounts" value={v.restricted_accounts} onChange={(x) => set("restricted_accounts", x)} />
              <Toggle label="Profile discoverability" value={v.profile_discoverable} onChange={(x) => set("profile_discoverable", x)} />
            </ToggleGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="ads">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Promoted posts" value={v.promoted_posts_enabled} onChange={(x) => set("promoted_posts_enabled", x)} />
              <Toggle label="Sponsored feed cards" value={v.sponsored_cards} onChange={(x) => set("sponsored_cards", x)} />
              <Toggle label="Pinned announcements" value={v.pinned_announcements} onChange={(x) => set("pinned_announcements", x)} />
              <Toggle label="Promoted rooms" value={v.promoted_rooms} onChange={(x) => set("promoted_rooms", x)} />
            </ToggleGrid>
            <Grid2>
              <NumRow label="Ad frequency (every N posts)" value={v.ad_frequency} onChange={(n) => set("ad_frequency", n)} min={3} max={50} />
              <div className="space-y-1.5">
                <Label>Sponsored label</Label>
                <Input value={v.sponsored_label} onChange={(e) => set("sponsored_label", e.target.value)} />
              </div>
            </Grid2>
          </SectionCard>
        </TabsContent>

        <TabsContent value="media">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Image compression" value={v.image_compression} onChange={(x) => set("image_compression", x)} />
              <Toggle label="Video compression" value={v.video_compression} onChange={(x) => set("video_compression", x)} />
              <Toggle label="CDN support" value={v.cdn_enabled} onChange={(x) => set("cdn_enabled", x)} />
              <Toggle label="Lazy loading" value={v.lazy_loading} onChange={(x) => set("lazy_loading", x)} />
              <Toggle label="Auto thumbnails" value={v.auto_thumbnails} onChange={(x) => set("auto_thumbnails", x)} />
              <Toggle label="Media optimization" value={v.media_optimization} onChange={(x) => set("media_optimization", x)} />
            </ToggleGrid>
            <SelectRow label="Upload quality" value={v.upload_quality} onChange={(x) => set("upload_quality", x as any)}
              options={[["low","Low"],["medium","Medium"],["high","High"],["original","Original"]]} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="profile">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Cover photo" value={v.cover_photo} onChange={(x) => set("cover_photo", x)} />
              <Toggle label="Profile themes" value={v.profile_themes} onChange={(x) => set("profile_themes", x)} />
              <Toggle label="Profile widgets" value={v.profile_widgets} onChange={(x) => set("profile_widgets", x)} />
              <Toggle label="Media gallery" value={v.media_gallery} onChange={(x) => set("media_gallery", x)} />
              <Toggle label="Profile badges" value={v.profile_badges} onChange={(x) => set("profile_badges", x)} />
              <Toggle label="Profile completion" value={v.profile_completion} onChange={(x) => set("profile_completion", x)} />
              <Toggle label="Verified badges" value={v.verified_badges} onChange={(x) => set("verified_badges", x)} />
            </ToggleGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="moderation">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Post approval system" value={v.post_approval} onChange={(x) => set("post_approval", x)} />
              <Toggle label="Auto moderation" value={v.auto_moderation} onChange={(x) => set("auto_moderation", x)} />
              <Toggle label="NSFW filtering" value={v.nsfw_filter} onChange={(x) => set("nsfw_filter", x)} />
              <Toggle label="Spam detection" value={v.spam_detection} onChange={(x) => set("spam_detection", x)} />
              <Toggle label="Duplicate detection" value={v.duplicate_detection} onChange={(x) => set("duplicate_detection", x)} />
              <Toggle label="Reports queue" value={v.reports_queue} onChange={(x) => set("reports_queue", x)} />
              <Toggle label="Shadow moderation" value={v.shadow_mod} onChange={(x) => set("shadow_mod", x)} />
            </ToggleGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="hashtags">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="Hashtags enabled" value={v.hashtags_enabled} onChange={(x) => set("hashtags_enabled", x)} />
              <Toggle label="Mentions enabled" value={v.mentions_enabled} onChange={(x) => set("mentions_enabled", x)} />
              <Toggle label="Hashtag analytics" value={v.hashtag_analytics} onChange={(x) => set("hashtag_analytics", x)} />
              <Toggle label="Clickable hashtag pages (/hashtag/xyz)" value={v.hashtag_pages} onChange={(x) => set("hashtag_pages", x)} />
            </ToggleGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="seo">
          <SectionCard>
            <ToggleGrid>
              <Toggle label="SEO for feed pages" value={v.seo_feed} onChange={(x) => set("seo_feed", x)} />
              <Toggle label="SEO for hashtag pages" value={v.seo_hashtags} onChange={(x) => set("seo_hashtags", x)} />
              <Toggle label="SEO for profiles" value={v.seo_profiles} onChange={(x) => set("seo_profiles", x)} />
              <Toggle label="SEO for public posts" value={v.seo_posts} onChange={(x) => set("seo_posts", x)} />
              <Toggle label="SEO for stories" value={v.seo_stories} onChange={(x) => set("seo_stories", x)} />
              <Toggle label="Open Graph metadata" value={v.og_metadata} onChange={(x) => set("og_metadata", x)} />
              <Toggle label="Schema markup (JSON-LD)" value={v.schema_markup} onChange={(x) => set("schema_markup", x)} />
              <Toggle label="Canonical tags" value={v.canonical_tags} onChange={(x) => set("canonical_tags", x)} />
            </ToggleGrid>
          </SectionCard>
        </TabsContent>

        <TabsContent value="performance">
          <SectionCard>
            <Grid2>
              <NumRow label="Feed cache (sec)" value={v.feed_cache_sec} onChange={(n) => set("feed_cache_sec", n)} min={0} max={600} />
              <NumRow label="Realtime polling (sec)" value={v.polling_interval_sec} onChange={(n) => set("polling_interval_sec", n)} min={5} max={300} />
              <NumRow label="Websocket connection limit" value={v.websocket_limit} onChange={(n) => set("websocket_limit", n)} min={50} max={50000} />
            </Grid2>
            <ToggleGrid>
              <Toggle label="Media preloading" value={v.media_preload} onChange={(x) => set("media_preload", x)} />
            </ToggleGrid>
            <p className="text-xs text-muted-foreground">Tuned for low-end Android devices, mobile bandwidth, and smooth scrolling.</p>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <Card><CardContent className="space-y-5 p-5">{children}</CardContent></Card>;
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
function ToggleGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-3">
      <div className="min-w-0 text-sm font-medium">{label}</div>
      <AdminToggle checked={value} onCheckedChange={onChange} />
    </label>
  );
}
function NumRow({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="number" min={min} max={max} value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))} />
    </div>
  );
}
function SelectRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm tabular-nums text-muted-foreground">{value}</span>
      </div>
      <Slider value={[value]} min={0} max={100} step={1} onValueChange={([n]) => onChange(n)} />
    </div>
  );
}
