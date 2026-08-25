import type { Url } from '../../lib/api';

export function UrlList({ urls, onDelete, onSelect, onToggle }: { urls: Url[]; onDelete: (id: string) => Promise<void>; onSelect: (id: string) => void; onToggle: (url: Url) => Promise<void> }) {
  return (
    <section className="card">
      <h2>Your shortened URLs</h2>
      {urls.length === 0 ? <p>No URLs yet. Create your first short link to get started.</p> : null}
      <ul className="url-list">
        {urls.map((url) => (
          <li key={url.id}>
            <button className="link-button" onClick={() => onSelect(url.id)}>{url.shortUrl}</button>
            <span>{url.originalUrl}</span>
            <span className={url.isActive ? 'badge good' : 'badge'}>{url.isActive ? 'Active' : 'Inactive'}</span>
            <button onClick={() => void navigator.clipboard.writeText(url.shortUrl)}>Copy</button>
            <button onClick={() => void onToggle(url)}>{url.isActive ? 'Deactivate' : 'Activate'}</button>
            <button onClick={() => window.confirm('Delete this URL?') && void onDelete(url.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
