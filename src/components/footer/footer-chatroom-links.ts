export interface FooterColumnConfig {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_CHATROOM_COLUMNS: FooterColumnConfig[] = [
  {
    title: "Famous Chat Rooms",
    links: [
      { label: "Indian Chat Room", href: "/india-chat-room" },
      { label: "Pakistani Chat Room", href: "/pakistani-chat-room" },
      { label: "Delhi Chat Room", href: "/delhi-chat-room" },
      { label: "Karachi Chat Room", href: "/karachi-chat-room" },
      { label: "Lahore Chat Room", href: "/lahore-chat-room" },
      { label: "Mumbai Chat Room", href: "/mumbai-chat-room" },
    ],
  },
  {
    title: "Popular Chat Rooms",
    links: [
      { label: "Girls Chat Room", href: "/girls-chat-room" },
      { label: "UK Chat Room", href: "/uk-chat-room" },
      { label: "USA Chat Room", href: "/usa-chat-room" },
      { label: "Dubai Chat Room", href: "/dubai-chat-room" },
      { label: "English Chat Room", href: "/english-chat-room" },
      { label: "Chat Rooms Without Registration", href: "/chat-rooms-without-registration" },
    ],
  },
];
