// Bindings available to the Worker (see wrangler.toml).
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ADMIN_PASSWORD?: string;
}
