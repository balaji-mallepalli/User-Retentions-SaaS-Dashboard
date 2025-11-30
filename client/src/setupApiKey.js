// Development helper: if a Vite env var `VITE_INGEST_API_KEY` is set,
// persist it to localStorage so the client automatically sends `x-api-key`.
// This is only intended for local development and should NOT be used in production.
const seedApiKeyFromEnv = () => {
  try {
    // Vite exposes env vars via import.meta.env
    const key = import.meta.env.VITE_INGEST_API_KEY;
    if (!key) return;
    const existing = localStorage.getItem('apiKey');
    if (!existing) {
      localStorage.setItem('apiKey', key);
      // do not force reload here; main.jsx will start and pick it up next load
      console.log('Dev helper: seeded apiKey from VITE_INGEST_API_KEY');
    }
  } catch (err) {
    // ignore in non-browser contexts
    // console.warn('seedApiKeyFromEnv error', err)
  }
};

export default seedApiKeyFromEnv;
