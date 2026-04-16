export type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
  msLeft?: number;
  remainingAttempts?: number;
  canResend?: boolean;
  [key: string]: unknown;
};

export const parseJsonResponse = async <T>(
  response: Response,
): Promise<T | null> => {
  const raw = await response.text();

  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const AUTH_TOKEN_KEY = "token";
const AUTH_COOKIE_KEY = "auth-token";
const AUTH_COOKIE_MAX_AGE_SECONDS = 30 * 60;

const isBrowser = () => typeof window !== "undefined";

const getCookieValue = (name: string): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(name.length + 1);
  return value ? decodeURIComponent(value) : null;
};

const buildCookieAttributes = (maxAge: number) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

export const getStoredAuthToken = (): string | null => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY) || getCookieValue(AUTH_COOKIE_KEY);
};

export const storeAuthToken = (token: string) => {
  if (!isBrowser() || !token) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(token)}; ${buildCookieAttributes(AUTH_COOKIE_MAX_AGE_SECONDS)}`;
};

export const clearAuthToken = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE_KEY}=; ${buildCookieAttributes(0)}`;
};

export const buildAuthHeaders = (headers?: HeadersInit): Headers => {
  const nextHeaders = new Headers(headers);
  const token = getStoredAuthToken();

  if (token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
};

export const authFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, {
    ...init,
    credentials: "include",
    headers: buildAuthHeaders(init?.headers),
  });
};