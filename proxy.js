// This proxy runs before Vercel's CDN on every request, including static assets.
// All times below are fixed UTC instants corresponding to Asia/Taipei (UTC+08:00).
// Block: 2026-11-13 00:00:00 inclusive through 2026-12-01 23:59:59.999 Taiwan time.
// Reopen: 2026-12-02 00:00:00 Taiwan time, no redeploy or scheduled job required.
const BLACKOUT_START_UTC = Date.parse('2026-11-12T16:00:00.000Z');
const BLACKOUT_END_UTC = Date.parse('2026-12-01T16:00:00.000Z');

export function isElectionBlackout(now = Date.now()) {
  return now >= BLACKOUT_START_UTC && now < BLACKOUT_END_UTC;
}

export default function proxy() {
  if (!isElectionBlackout()) return; // Continue normally outside the window.

  const body = '<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>網站暫停服務</title></head><body><main><h1>網站暫停服務</h1><p>因應 2026 年地方選舉期間民調資訊揭露規範，本站暫停對外提供內容。</p><p>預定於台灣時間 2026 年 12 月 2 日 00:00 恢復服務。</p></main></body></html>';
  return new Response(body, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
      'Retry-After': '86400',
      'X-Robots-Tag': 'noindex, noarchive',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; base-uri 'none'"
    }
  });
}
