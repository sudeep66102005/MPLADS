export type JsonObject = Record<string, unknown>;

export function normalizeServer(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("Use an HTTPS server address, or localhost for development.");
  }
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("Enter just the server origin, for example https://your-api.example.com");
  }
  return url.origin;
}

export async function request<T>(base: string, token: string, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", "Bearer " + token);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(base + "/api/v1" + path, { ...options, headers, signal: controller.signal, cache: "no-store" });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const detail = typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail || "Request failed");
      throw new Error(response.status === 401 ? "Session unavailable. Sign in again. " + detail : detail);
    }
    return response.status === 204 ? undefined as T : response.json();
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw new Error("The free server is taking longer to wake up. Wait a moment, then try again.");
    if (e instanceof TypeError) throw new Error("Could not reach the app server. Check your connection and try again; the free server may still be starting.");
    throw e;
  } finally { clearTimeout(timer); }
}

export async function download(base: string, token: string, path: string, filename: string) {
  const response = await fetch(base + "/api/v1" + path, { headers: { Authorization: "Bearer " + token } });
  if (!response.ok) throw new Error("Download failed. Check your connection and sign-in.");
  const url = URL.createObjectURL(await response.blob());
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
