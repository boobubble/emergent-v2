import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust, Security & Privacy" },
      {
        name: "description",
        content:
          "How we protect your account, your messages, and your data on this community platform.",
      },
      { property: "og:title", content: "Trust, Security & Privacy" },
      {
        property: "og:description",
        content:
          "Our approach to authentication, data protection, moderation, and user privacy.",
      },
    ],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-foreground">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Trust, Security & Privacy</h1>
        <p className="mt-3 text-muted-foreground">
          We take protecting your account and your conversations seriously. This page
          explains the controls we have in place. It is maintained by our team and is
          not an independent certification.
        </p>
      </header>

      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-semibold">Account security</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Passwords are hashed and managed by our authentication provider.</li>
          <li>Optional social sign-in (Google) for stronger account protection.</li>
          <li>Sessions are bound to the device and can be revoked by signing out.</li>
          <li>Device fingerprinting and ban enforcement help us block abusive accounts.</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-semibold">Data protection</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>
            Database access is restricted by row-level security so each user can only
            read and modify their own data.
          </li>
          <li>
            Direct messages are limited to accepted friends. Private rooms require an
            invitation and optional password.
          </li>
          <li>
            Sensitive fields such as IP addresses are never exposed to other users.
          </li>
          <li>Secrets and API keys are stored server-side and never shipped to the browser.</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-semibold">Moderation & safety</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Word filters block prohibited content before it is posted.</li>
          <li>Users can report messages, posts, and profiles from anywhere in the app.</li>
          <li>Moderators can mute, ban, or remove harmful content.</li>
          <li>All moderator actions are logged for accountability.</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-2xl font-semibold">Your choices</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
          <li>Block or ignore other users at any time.</li>
          <li>Delete your own posts and messages.</li>
          <li>Request account deletion by contacting support.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Reporting a vulnerability</h2>
        <p className="text-sm text-muted-foreground">
          If you believe you have found a security issue, please report it through the
          in-app feedback tool so our team can investigate.
        </p>
        <p className="pt-6 text-sm">
          <Link to="/" className="text-primary underline-offset-4 hover:underline">
            ← Back home
          </Link>
        </p>
      </section>
    </main>
  );
}
