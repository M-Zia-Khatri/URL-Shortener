import type { Analytics, Url } from '../lib/api';

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return <div className="bar"><span>{label}</span><strong style={{ width: `${max ? (value / max) * 100 : 0}%` }}>{value}</strong></div>;
}

export function AnalyticsPage({ url, analytics, loading, error }: { url?: Url | null; analytics?: Analytics | null; loading: boolean; error: string }) {
  if (!url) return <main><h1>404</h1><p>Select a URL from the dashboard to view details and analytics.</p></main>;
  const max = Math.max(analytics?.clicksLast7Days ?? 0, analytics?.clicksLast30Days ?? 0, 1);
  return <main><h1>URL Details</h1><section className="card"><p><b>Short URL:</b> {url.shortUrl}</p><p><b>Original:</b> {url.originalUrl}</p><p><b>Status:</b> {url.isActive ? 'Active' : 'Inactive'}</p><p><b>Expiration:</b> {url.expiresAt ?? 'None'}</p></section>{loading && <p>Loading analytics…</p>}{error && <p role="alert">{error}</p>}{analytics && <section className="card"><h2>Analytics</h2><div className="stats"><span>Total {analytics.totalClicks}</span><span>Today {analytics.clicksToday}</span></div><Bar label="Last 7 days" value={analytics.clicksLast7Days} max={max} /><Bar label="Last 30 days" value={analytics.clicksLast30Days} max={max} /><h3>Top referrers</h3><ul>{analytics.topReferrers.map((r) => <li key={r.key}>{r.key}: {r.count}</li>)}</ul><h3>Recent clicks</h3><ul>{analytics.recentClicks.map((c) => <li key={c.id}>{new Date(c.clickedAt).toLocaleString()} · {c.referrer ?? 'Direct'}</li>)}</ul></section>}</main>;
}
