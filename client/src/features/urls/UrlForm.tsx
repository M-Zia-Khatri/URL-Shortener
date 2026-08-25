import { useState } from 'react';

export function UrlForm({ onCreate }: { onCreate: (url: string, expiresAt?: string) => Promise<void> }) {
  const [url, setUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  return (
    <form
      className="card form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        try {
          const parsed = new URL(url);
          if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use http or https URLs only.');
        } catch {
          setError('Enter a valid http or https URL.');
          return;
        }
        setBusy(true);
        try {
          await onCreate(url, expiresAt);
          setUrl('');
          setExpiresAt('');
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>Destination URL<input aria-label="URL to shorten" required type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} /></label>
      <label>Expiration<input aria-label="Expiration" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy}>{busy ? 'Shortening…' : 'Shorten URL'}</button>
    </form>
  );
}
