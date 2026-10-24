// TDR Revision Hub service worker — shows push notifications as system banners even when the tab is closed.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // If the Hub tab is already focused the in-app toast is enough.
    if (wins.some((c) => c.focused)) return;
    await self.registration.showNotification(d.title || 'TDR Revision Hub', {
      body: d.body || '',
      icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png',
      tag: d.tag || undefined,
      data: { url: d.url || '/', projectId: d.projectId || '' },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of wins) {
      if ('focus' in c) {
        await c.focus();
        if (data.projectId) c.postMessage({ type: 'open-project', projectId: data.projectId });
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(data.url || '/');
  })());
});
