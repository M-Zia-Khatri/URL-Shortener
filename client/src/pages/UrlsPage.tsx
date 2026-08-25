import type { PaginatedUrls, Url } from '../lib/api';
import { UrlList } from '../features/urls/UrlList';

export function UrlsPage({ page, loading, error, onDelete, onSelect, onToggle, onPage }: { page: PaginatedUrls; loading: boolean; error: string; onDelete: (id: string) => Promise<void>; onSelect: (id: string) => void; onToggle: (url: Url) => Promise<void>; onPage: (page: number) => void }) {
  return <main><h1>URL Dashboard</h1>{loading && <p>Loading URLs…</p>}{error && <p role="alert">{error}</p>}<UrlList urls={page.items} onDelete={onDelete} onSelect={onSelect} onToggle={onToggle} /><div className="pager"><button disabled={page.page <= 1} onClick={() => onPage(page.page - 1)}>Previous</button><span>Page {page.page} · {page.total} total</span><button disabled={!page.hasMore} onClick={() => onPage(page.page + 1)}>Next</button></div></main>;
}
