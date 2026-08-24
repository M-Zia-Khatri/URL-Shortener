const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type Url = { id: string; originalUrl: string; shortCode: string; shortUrl: string; isActive: boolean; expiresAt: string | null; createdAt: string };
export type PaginatedUrls = { items: Url[]; page: number; pageSize: number; total: number; hasMore: boolean };
export type Analytics = {
  totalClicks: number;
  clicksToday: number;
  clicksLast7Days: number;
  clicksLast30Days: number;
  topReferrers: { key: string; count: number }[];
  topCountries: { key: string; count: number }[];
  recentClicks: { id: string; clickedAt: string; referrer: string | null; country: string | null; userAgent: string | null }[];
  pagination: { page: number; pageSize: number; hasMore: boolean };
};

type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, { headers: { 'content-type': 'application/json', ...init?.headers }, ...init });
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || body?.success === false) throw new Error(body?.success === false ? body.error.message : 'Request failed');
  return body && 'data' in body ? body.data : (body as T);
}

export const urlsApi = {
  list: (page = 1) => api<PaginatedUrls>(`/api/urls?page=${page}&limit=10`),
  get: (id: string) => api<Url>(`/api/urls/${id}`),
  create: (originalUrl: string, expiresAt?: string) =>
    api<Url>('/api/urls', { method: 'POST', body: JSON.stringify({ originalUrl, expiresAt: expiresAt || undefined }) }),
  update: (id: string, body: Partial<Pick<Url, 'originalUrl' | 'expiresAt'>>) => api<Url>(`/api/urls/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  setActive: (url: Url, isActive: boolean) => urlsApi.update(url.id, { originalUrl: url.originalUrl, expiresAt: url.expiresAt, isActive } as any),
  remove: (id: string) => api<void>(`/api/urls/${id}`, { method: 'DELETE' }),
  analytics: (id: string, page = 1) => api<Analytics>(`/api/urls/${id}/analytics?page=${page}&pageSize=10`),
};
