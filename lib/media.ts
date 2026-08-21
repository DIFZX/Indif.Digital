const LOCAL_MEDIA_PREFIX = "/media/";

function getMediaBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (!configuredBaseUrl) return null;

  const parsedBaseUrl = new URL(configuredBaseUrl);
  if (parsedBaseUrl.protocol !== "https:" && parsedBaseUrl.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_MEDIA_BASE_URL harus menggunakan http:// atau https://");
  }

  parsedBaseUrl.search = "";
  parsedBaseUrl.hash = "";
  return parsedBaseUrl.toString().replace(/\/+$/, "");
}

const MEDIA_BASE_URL = getMediaBaseUrl();

export function resolveMediaUrl(path: string): string;
export function resolveMediaUrl(path: null | undefined): null;
export function resolveMediaUrl(path: string | null | undefined): string | null;
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const trimmedPath = path.trim();
  if (!trimmedPath) return "";

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(trimmedPath)) {
    return trimmedPath;
  }

  const localPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  if (!localPath.startsWith(LOCAL_MEDIA_PREFIX) || !MEDIA_BASE_URL) {
    return localPath;
  }

  return new URL(localPath.slice(1), `${MEDIA_BASE_URL}/`).toString();
}
