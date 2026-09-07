// Portfolio MVP mode: catalog and user-data screens use local JS data/localStorage.
// HER Assistant is intentionally separate and still posts to backend/api/assistant.php.
export const USE_REMOTE_DATA_API = false;

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const isLocalDevelopment = LOCAL_HOSTNAMES.has(globalThis.location?.hostname || '');

export const ASSISTANT_API_URL = isLocalDevelopment
  ? new URL('../backend/api/assistant.php', import.meta.url)
  : new URL('https://herown-api.onrender.com/backend/api/assistant.php');
