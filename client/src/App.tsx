import { useEffect, useState } from 'react';
import { urlsApi, type Analytics, type PaginatedUrls, type Url } from './lib/api';
import { HomePage } from './pages/HomePage';
import { UrlsPage } from './pages/UrlsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import './App.css';

type Page = 'home' | 'urls' | 'analytics';
const emptyPage: PaginatedUrls = { items: [], page: 1, pageSize: 10, total: 0, hasMore: false };

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [urls, setUrls] = useState<PaginatedUrls>(emptyPage);
  const [selected, setSelected] = useState<Url | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [created, setCreated] = useState<Url | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = async (next = urls.page) => {
    setLoading(true);
    setError('');
    try { setUrls(await urlsApi.list(next)); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load URLs'); } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(1); }, []);

  const create = async (originalUrl: string, expiresAt?: string) => {
    setError('');
    const result = await urlsApi.create(originalUrl, expiresAt);
    setCreated(result);
    await refresh(1);
  };
  const remove = async (id: string) => { await urlsApi.remove(id); if (selected?.id === id) setSelected(null); await refresh(); };
  const toggle = async (url: Url) => { await urlsApi.update(url.id, { isActive: !url.isActive } as any); await refresh(); };
  const select = async (id: string) => {
    setPage('analytics');
    setLoading(true);
    setError('');
    try { const url = await urlsApi.get(id); setSelected(url); setAnalytics(await urlsApi.analytics(id)); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load details'); } finally { setLoading(false); }
  };

  return <><header><strong>Shortly</strong><nav>{(['home', 'urls', 'analytics'] as Page[]).map((p) => <button key={p} onClick={() => setPage(p)}>{p}</button>)}</nav></header>{error && page === 'home' && <p role="alert">{error}</p>}{page === 'home' && <HomePage onCreate={create} created={created} />}{page === 'urls' && <UrlsPage page={urls} loading={loading} error={error} onDelete={remove} onSelect={select} onToggle={toggle} onPage={(p) => void refresh(p)} />}{page === 'analytics' && <AnalyticsPage url={selected} analytics={analytics} loading={loading} error={error} />}</>;
}
