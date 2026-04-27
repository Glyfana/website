const DEFAULT_ALLOWED_ORIGINS = ['https://glyfana.github.io'];

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAllowedOrigins(env) {
  const configured = splitCsv(env.ALLOWED_ORIGINS);
  return configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function buildCorsHeaders(origin, env) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });

  if (origin && getAllowedOrigins(env).includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

function jsonResponse(payload, init = {}, env, origin = '') {
  const headers = buildCorsHeaders(origin, env);
  headers.set('Content-Type', 'application/json; charset=utf-8');

  if (init.headers) {
    for (const [key, value] of new Headers(init.headers).entries()) {
      headers.set(key, value);
    }
  }

  return new Response(JSON.stringify(payload), {
    ...init,
    headers,
  });
}

function textResponse(body, init = {}, env, origin = '') {
  const headers = buildCorsHeaders(origin, env);

  if (init.headers) {
    for (const [key, value] of new Headers(init.headers).entries()) {
      headers.set(key, value);
    }
  }

  return new Response(body, {
    ...init,
    headers,
  });
}

function normalizeString(value, maxLength = 512) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function parseBrowserFamily(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('chrome/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  return 'Other';
}

function parseOsFamily(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'Unknown';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'Mac OS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
  return 'Other';
}

function sanitizeEvent(body) {
  const site = normalizeString(body?.site, 120);
  const eventName = normalizeString(body?.name, 80);
  const path = normalizeString(body?.path, 256);
  const pageHref = normalizeString(body?.pageHref, 1024);
  const targetHref = normalizeString(body?.href, 1024);
  const label = normalizeString(body?.label, 256);
  const lang = normalizeString(body?.lang, 16);
  const referrerHost = normalizeString(body?.referrerHost, 255);
  const buildId = normalizeString(body?.buildId, 80);

  if (!site || !eventName || !path || !pageHref) {
    return null;
  }

  return {
    site,
    eventName,
    path,
    pageHref,
    targetHref,
    label,
    lang,
    referrerHost,
    buildId,
  };
}

async function writeEvent(env, event, request) {
  const browserFamily = parseBrowserFamily(request.headers.get('user-agent'));
  const osFamily = parseOsFamily(request.headers.get('user-agent'));
  const country = normalizeString(request.cf?.country || '', 16);
  const createdAt = new Date().toISOString();

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO analytics_events (
      site,
      event_name,
      path,
      page_href,
      target_href,
      label,
      lang,
      referrer_host,
      build_id,
      browser_family,
      os_family,
      country,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      event.site,
      event.eventName,
      event.path,
      event.pageHref,
      event.targetHref,
      event.label,
      event.lang,
      event.referrerHost,
      event.buildId,
      browserFamily,
      osFamily,
      country,
      createdAt,
    )
    .run();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return textResponse('', { status: 204 }, env, origin);
    }

    if (url.pathname === '/health') {
      return jsonResponse({ ok: true }, { status: 200 }, env, origin);
    }

    if (url.pathname !== '/collect') {
      return jsonResponse({ ok: false, error: 'not_found' }, { status: 404 }, env, origin);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'method_not_allowed' }, { status: 405 }, env, origin);
    }

    const allowedOrigins = getAllowedOrigins(env);
    if (!origin || !allowedOrigins.includes(origin)) {
      return jsonResponse({ ok: false, error: 'origin_not_allowed' }, { status: 403 }, env, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: 'invalid_json' }, { status: 400 }, env, origin);
    }

    const event = sanitizeEvent(body);
    if (!event) {
      return jsonResponse({ ok: false, error: 'invalid_event' }, { status: 400 }, env, origin);
    }

    try {
      await writeEvent(env, event, request);
      return textResponse('', { status: 204 }, env, origin);
    } catch {
      return jsonResponse({ ok: false, error: 'write_failed' }, { status: 500 }, env, origin);
    }
  },
};
