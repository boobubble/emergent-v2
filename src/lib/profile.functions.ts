import { createServerFn } from "@tanstack/react-start";
import { getPublicProfileByUsername, type PublicProfileSeoRow } from "./profile.public";

/**
 * Client-navigation RPC for /u/$username.
 * The handler runs on the server (service-role lookup). The browser must not
 * import `@/integrations/supabase/client.server` in the route loader.
 */
export const getPublicProfileByUsernameFn = createServerFn({ method: "GET" })
  .inputValidator((input: { username: string }) => input)
  .handler(async ({ data }): Promise<PublicProfileSeoRow | null> => {
    return getPublicProfileByUsername(data.username);
  });
