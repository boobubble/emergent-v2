import { HOME_SEO_H1 } from "@/lib/seo/home-page";

const linkClass =
  "font-medium text-primary underline-offset-4 hover:underline";

/**
 * Server-safe homepage copy. Must render in the initial HTML without
 * client-only gates so crawlers receive a real H1, paragraphs, and hrefs.
 */
export function HomeSeoContent() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="/" className="text-base font-semibold tracking-tight">
            Yaarzo
          </a>
          <nav aria-label="Homepage" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <a href="/chatroom" className={linkClass}>Chatrooms</a>
            <a href="/feed" className={linkClass}>Feed</a>
            <a href="/communities" className={linkClass}>Communities</a>
            <a href="/competitions" className={linkClass}>Competitions</a>
            <a href="/poetry" className={linkClass}>Poetry</a>
            <a
              href="/welcome"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Join free
            </a>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-primary">Yaarzo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {HOME_SEO_H1}
        </h1>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>
            Yaarzo is a free place to meet people in live online chatrooms and keep
            conversations going with friends around the world. Whether you want a
            quick hello after work or a longer talk about something you love, you
            can walk in, join a room, and start chatting without a complicated setup.
          </p>
          <p>
            The platform is also a social community. Members share posts on the{" "}
            <a href="/feed" className={linkClass}>feed</a>, keep public profiles,
            join <a href="/communities" className={linkClass}>communities</a>, enter{" "}
            <a href="/competitions" className={linkClass}>competitions</a>, and
            publish <a href="/poetry" className={linkClass}>poetry and shayari</a>.
            The idea is simple: one friendly space where conversations, creativity,
            and new friendships can grow together.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Meet New People Through Online Chatrooms
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Yaarzo{" "}
            <a href="/chatroom" className={linkClass}>chatrooms</a>{" "}
            are organized around how people actually connect: by city, by country,
            and by interest. You can browse rooms tied to places such as{" "}
            <a href="/india-chat-room" className={linkClass}>India</a> and{" "}
            <a href="/pakistan-chat-room" className={linkClass}>Pakistan</a>, drop
            into a city room like{" "}
            <a href="/lahore-chat-room" className={linkClass}>Lahore</a>, or choose
            a topic when you would rather talk about a hobby than a location.
            Public social conversations stay easy to discover, so you can listen
            first and join when you feel ready. Rooms stay open for casual hangouts,
            late-night talks, and regular groups of friends who keep coming back.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">
            More Than Just a Chat Room
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            A chat window is only the beginning. The social{" "}
            <a href="/feed" className={linkClass}>feed</a> lets you share posts,
            react, and follow what the community is talking about today. Your
            profile is the public face of those conversations, so people you meet
            in a room can remember you and continue the friendship later.{" "}
            <a href="/communities" className={linkClass}>Communities</a> gather
            members around a shared purpose.{" "}
            <a href="/competitions" className={linkClass}>Competitions</a> add a
            playful challenge, from contests to creative showdowns.{" "}
            <a href="/poetry" className={linkClass}>Poetry and shayari</a> give
            writers a quieter corner to share verses and read others. Together
            these pieces make Yaarzo feel like a full social home rather than a
            single chat box.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Find Communities That Match Your Interests
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Interest-based discovery is part of everyday browsing. If you care
            about music, sport, study, humour, or late-night conversation, you can
            look for <a href="/communities" className={linkClass}>communities</a>{" "}
            and rooms that already gather around those topics. You do not need to
            know anyone in advance: public discussions make it natural to join,
            introduce yourself, and find people who enjoy the same things. Over
            time those interest groups become familiar circles — places you return
            to because the talk feels yours.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Start Exploring Yaarzo
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Open a <a href="/chatroom" className={linkClass}>chatroom</a>, scroll
            the <a href="/feed" className={linkClass}>feed</a>, or browse{" "}
            <a href="/communities" className={linkClass}>communities</a> and see
            who is around. Yaarzo is free to join, and you can start with a single
            conversation. When you are ready, create a profile, share a post, enter
            a competition, or publish a few lines of poetry. New friends are often
            one hello away.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/welcome"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Join Yaarzo free
            </a>
            <a
              href="/chatroom"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Browse chatrooms
            </a>
          </div>
        </section>
      </article>
    </main>
  );
}
