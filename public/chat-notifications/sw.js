/* Chatroom browser notifications only. No fetch handler — does not control the site. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const channelId = event.notification.data && event.notification.data.channelId;
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of all) {
      client.postMessage({ type: "yaarzo:open-chat-room", channelId });
      try { await client.focus(); } catch { /* ignore */ }
    }
    if (all.length === 0) {
      await self.clients.openWindow("/chatroom");
    }
  })());
});
