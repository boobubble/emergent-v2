import { supabase } from "@/integrations/supabase/client";

/**
 * Yahoo-style private mini-room (Trio Room) service.
 * Rooms reuse the existing `messages` table with channel_id = `trio:<roomId>`.
 * RLS enforces that only accepted members of an open room can read or send.
 */

export type TrioStatus = "invited" | "accepted" | "rejected" | "blocked" | "left";

export interface TrioRoom {
  id: string;
  name: string;
  owner_id: string;
  hidden: boolean;
  password_required?: boolean;
  closed_at: string | null;
  closed_reason: string | null;
  created_at: string;
}

export interface TrioMember {
  room_id: string;
  user_id: string;
  status: TrioStatus;
  invited_by: string | null;
  invited_at: string;
  joined_at: string | null;
}

const ROOM_COLS = "id,name,owner_id,hidden,closed_at,closed_reason,created_at";

export function trioChannel(roomId: string): string {
  return `trio:${roomId}`;
}

export const TRIO_CREATE_COST = 100;
export const TRIO_JOIN_COST = 50;

export async function getMyCoins(): Promise<number> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return 0;
  const { data } = await supabase.from("profiles").select("coins").eq("id", uid).maybeSingle();
  return data?.coins ?? 0;
}

export async function createRoom(opts: {
  name: string;
  password?: string | null;
  hidden?: boolean;
}): Promise<TrioRoom> {
  const { data, error } = await supabase.rpc("create_trio_room", {
    _name: opts.name.trim().slice(0, 60),
    _password: opts.password?.trim() || undefined,
    _hidden: !!opts.hidden,
  });
  if (error) throw error;
  return data as TrioRoom;
}


export async function inviteByUsername(roomId: string, username: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Not signed in");
  const cleaned = username.trim().replace(/^@/, "");
  if (!cleaned) throw new Error("Username required");
  const { data: prof, error: pErr } = await supabase
    .from("profiles")
    .select("id,username")
    .ilike("username", cleaned)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!prof) throw new Error(`No user @${cleaned}`);
  if (prof.id === uid) throw new Error("Can't invite yourself");
  const { error } = await supabase.from("trio_room_members").insert({
    room_id: roomId,
    user_id: prof.id,
    status: "invited",
    invited_by: uid,
  });
  if (error) {
    if (/duplicate|unique/i.test(error.message)) throw new Error("Already invited");
    throw error;
  }
}

export async function acceptInvite(roomId: string, password?: string): Promise<void> {
  const { error } = await supabase.rpc("accept_trio_invite", {
    _room: roomId,
    _password: password ?? undefined,
  });
  if (error) throw error;
}

export async function rejectInvite(roomId: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase
    .from("trio_room_members")
    .update({ status: "rejected" })
    .eq("room_id", roomId)
    .eq("user_id", uid);
}

export async function leaveRoom(roomId: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase
    .from("trio_room_members")
    .update({ status: "left" })
    .eq("room_id", roomId)
    .eq("user_id", uid);
}

export async function closeRoom(roomId: string, reason = "Closed by owner"): Promise<void> {
  await supabase
    .from("trio_rooms")
    .update({ closed_at: new Date().toISOString(), closed_reason: reason })
    .eq("id", roomId);
}

export async function listMyRooms(): Promise<TrioRoom[]> {
  const { data, error } = await supabase
    .from("trio_rooms")
    .select(ROOM_COLS)
    .is("closed_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrioRoom[];
}

export async function listMembers(roomId: string): Promise<TrioMember[]> {
  const { data, error } = await supabase
    .from("trio_room_members")
    .select("room_id,user_id,status,invited_by,invited_at,joined_at")
    .eq("room_id", roomId);
  if (error) throw error;
  return (data ?? []) as TrioMember[];
}

export async function listMyMemberships(): Promise<TrioMember[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("trio_room_members")
    .select("room_id,user_id,status,invited_by,invited_at,joined_at")
    .eq("user_id", uid);
  if (error) throw error;
  return (data ?? []) as TrioMember[];
}
