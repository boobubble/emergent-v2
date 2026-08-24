export const ADMIN_ROBOTS = "noindex, nofollow";
export const ADMIN_SEO_TITLE = "Admin | Yaarzo";

export function adminRouteHead() {
  return {
    meta: [
      { title: ADMIN_SEO_TITLE },
      { name: "robots", content: ADMIN_ROBOTS },
    ],
  };
}
