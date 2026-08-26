import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";
import { PillAvatar } from "@/components/home/welcome-primitives";

const HTTPS =
  "https://aofjhfsecwsrcvvvcfcy.supabase.co/storage/v1/object/public/avatars/u1/avatar-1787317005596.png";

describe("PillAvatar", () => {
  it("renders a transformed img for an approved https avatar", () => {
    const html = renderToString(
      React.createElement(PillAvatar, { name: "davidm", src: HTTPS, lazy: false }),
    );
    expect(html).toContain("<img");
    expect(html).toContain("/storage/v1/render/image/public/avatars/u1/avatar-1787317005596.png");
    expect(html).toContain("width=\"32\"");
    expect(html).not.toContain("opacity-0");
    expect(html).toContain("D");
  });

  it("keeps initials and omits img when no approved url is provided", () => {
    const html = renderToString(React.createElement(PillAvatar, { name: "sona" }));
    expect(html).not.toContain("<img");
    expect(html).toContain("S");
  });
});
