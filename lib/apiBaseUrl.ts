const splitPossibleUrls = (value: unknown): string[] => {
  const raw = String(value || "").trim();
  if (!raw) return [];

  return raw
    .split(/(?=https?:\/\/)/i)
    .map((part) => part.trim())
    .filter(Boolean);
};

const normalizeApiBaseUrl = (value: unknown): string | null => {
  const candidates = splitPossibleUrls(value);

  // Prefer URL candidates that look like backend/API hosts when multiple are present.
  const scored = candidates
    .map((candidate) => {
      const lower = candidate.toLowerCase();
      const score =
        (lower.includes("backend") ? 4 : 0) +
        (lower.includes("api") ? 2 : 0) +
        (lower.includes("onrender") ? 1 : 0);
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  for (const { candidate } of scored) {
    try {
      const parsed = new URL(candidate);
      return parsed.origin;
    } catch {
      // Ignore and continue.
    }
  }

  return null;
};

export const getApiBaseUrl = (): string => {
  return normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL) || "";
};
