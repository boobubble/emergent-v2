import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type TestimonialRow = {
  id: string;
  author_id: string;
  target_user_id: string;
  body: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
  author_username?: string | null;
  author_avatar_color?: string | null;
};

// List testimonials written ABOUT a user (defaults to current user)
export const listTestimonialsForUser = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        targetUserId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(50).default(10),
      })
      .parse(d ?? {}),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const target = data.targetUserId ?? context.userId;
    const { data: rows, error } = await admin
      .from("testimonials")
      .select("*")
      .eq("target_user_id", target)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);

    const authorIds = Array.from(new Set((rows ?? []).map((r) => r.author_id)));
    let authors: Record<string, { username: string | null; avatarColor: string | null }> = {};
    if (authorIds.length) {
      const { data: profs } = await admin
        .from("profiles")
        .select("id, username, avatar_color")
        .in("id", authorIds);
      for (const p of profs ?? []) {
        authors[p.id] = { username: p.username, avatarColor: (p as { avatar_color?: string | null }).avatar_color ?? null };
      }
    }

    return (rows ?? []).map((r) => ({
      ...r,
      author_username: authors[r.author_id]?.username ?? null,
      author_avatar_color: authors[r.author_id]?.avatarColor ?? null,
    })) as TestimonialRow[];
  });

// Create or update (upsert) a testimonial about another user
export const writeTestimonial = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        targetUserId: z.string().uuid(),
        body: z.string().trim().min(1).max(500),
      })
      .parse(d),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    if (data.targetUserId === context.userId) {
      throw new Error("You cannot write a testimonial about yourself.");
    }
    const admin = await getAdmin();
    const { data: row, error } = await admin
      .from("testimonials")
      .upsert(
        {
          author_id: context.userId,
          target_user_id: data.targetUserId,
          body: data.body,
          approved: true,
        } as never,
        { onConflict: "author_id,target_user_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const admin = await getAdmin();
    const { data: row } = await admin
      .from("testimonials")
      .select("author_id, target_user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("Testimonial not found.");
    if (row.author_id !== context.userId && row.target_user_id !== context.userId) {
      throw new Error("Not allowed.");
    }
    const { error } = await admin.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
