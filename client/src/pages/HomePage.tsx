import type { Url } from '../lib/api';
import { UrlForm } from '../features/urls/UrlForm';

export function HomePage({ onCreate, created }: { onCreate: (url: string, expiresAt?: string) => Promise<void>; created?: Url | null }) {
  return <main><h1>Create Short URL</h1><p>Fast, simple URL shortener with no account required.</p><UrlForm onCreate={onCreate} />{created && <section className="card"><h2>Created</h2><p>{created.shortUrl}</p><button onClick={() => void navigator.clipboard.writeText(created.shortUrl)}>Copy short URL</button></section>}</main>;
}
