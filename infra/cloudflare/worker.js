export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const appOrigin = env.HIEVENTS_ORIGIN;
    const landingOrigin = env.LANDING_ORIGIN;

    const appPrefixes = [
      '/app',
      '/api',
      '/sanctum',
      '/storage',
      '/build',
      '/vendor'
    ];

    const isAppPath = appPrefixes.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix + '/'));

    if (isAppPath) {
      const upstream = new URL(appOrigin);
      const forward = new URL(request.url);

      // Strip /app prefix before hitting Hi.Events origin.
      if (forward.pathname === '/app') {
        forward.pathname = '/';
      } else if (forward.pathname.startsWith('/app/')) {
        forward.pathname = forward.pathname.replace('/app', '');
      }

      upstream.pathname = forward.pathname;
      upstream.search = forward.search;

      const appRequest = new Request(upstream.toString(), request);
      appRequest.headers.set('X-Forwarded-Host', url.host);
      appRequest.headers.set('X-Forwarded-Proto', 'https');
      appRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');

      const appResponse = await fetch(appRequest, {
        cf: { cacheTtl: 0, cacheEverything: false }
      });

      return appResponse;
    }

    const landingUrl = new URL(url.pathname + url.search, landingOrigin);
    const landingRequest = new Request(landingUrl.toString(), request);

    return fetch(landingRequest, {
      cf: { cacheEverything: true, cacheTtl: 3600 }
    });
  }
};
