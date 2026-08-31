const linkClass =
  "font-semibold text-purple-300 underline-offset-4 hover:underline";

const cardClass =
  "rounded-2xl border border-white/[0.07] bg-[#10101f]/80 p-5 backdrop-blur-xl sm:p-6";

/**
 * Crawlable homepage body copy. Keep these strings aligned with HomeSeoContent.
 */
export function HomeSeoCopy() {
  return (
    <section data-seo-copy className="mx-auto max-w-7xl space-y-4 px-4 pb-12 sm:px-6 lg:px-8">
      <div className={cardClass}>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Meet New People Through Online Chatrooms
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
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
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          More Than Just a Chat Room
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
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
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Find Communities That Match Your Interests
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
          Interest-based discovery is part of everyday browsing. If you care
          about music, sport, study, humour, or late-night conversation, you can
          look for <a href="/communities" className={linkClass}>communities</a>{" "}
          and rooms that already gather around those topics. You do not need to
          know anyone in advance: public discussions make it natural to join,
          introduce yourself, and find people who enjoy the same things. Over
          time those interest groups become familiar circles — places you return
          to because the talk feels yours.
        </p>
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Start Exploring Yaarzo
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
          Open a <a href="/chatroom" className={linkClass}>chatroom</a>, scroll
          the <a href="/feed" className={linkClass}>feed</a>, or browse{" "}
          <a href="/communities" className={linkClass}>communities</a> and see
          who is around. Yaarzo is free to join, and you can start with a single
          conversation. When you are ready, create a profile, share a post, enter
          a competition, or publish a few lines of poetry. New friends are often
          one hello away.
        </p>
      </div>
    </section>
  );
}
