export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const appOrigin = env.HIEVENTS_ORIGIN;
    const landingOrigin = env.LANDING_ORIGIN;

    const setupResponse = new Response(
      `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VIC Event Portal Setup In Progress</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #091428; color: #ecf3ff; }
    .wrap { max-width: 680px; margin: 8vh auto; padding: 24px; }
    .card { border: 1px solid rgba(255,255,255,.2); border-radius: 12px; padding: 24px; background: rgba(255,255,255,.04); }
    h1 { margin-top: 0; }
    p { line-height: 1.6; color: #c8d8f1; }
    a { color: #ffb703; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>VIC Event Portal Is Being Connected</h1>
      <p>The registration app is not fully linked yet. Please check again shortly.</p>
      <p>You can continue browsing the main site at <a href="/">vic.college</a>.</p>
    </div>
  </div>
</body>
</html>`,
      {
        status: 503,
        headers: {
          'content-type': 'text/html; charset=UTF-8',
          'x-vic-worker': 'active'
        }
      }
    );

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
      if (!appOrigin || appOrigin.includes('replace-me.up.railway.app')) {
        return setupResponse;
      }

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

      try {
        const appResponse = await fetch(appRequest, {
          cf: { cacheTtl: 0, cacheEverything: false }
        });

        if (appResponse.status >= 500) {
          return setupResponse;
        }

        const passThroughHeaders = new Headers(appResponse.headers);
        passThroughHeaders.set('x-vic-worker', 'active');

        return new Response(appResponse.body, {
          status: appResponse.status,
          statusText: appResponse.statusText,
          headers: passThroughHeaders
        });
      } catch {
        return setupResponse;
      }
    }

    const landingUrl = new URL(url.pathname + url.search, landingOrigin);
    const landingRequest = new Request(landingUrl.toString(), request);

    const landingResponse = await fetch(landingRequest, {
      cf: { cacheEverything: true, cacheTtl: 3600 }
    });

    const landingHeaders = new Headers(landingResponse.headers);
    landingHeaders.set('x-vic-worker', 'active');

    return new Response(landingResponse.body, {
      status: landingResponse.status,
      statusText: landingResponse.statusText,
      headers: landingHeaders
    });
  }
};
