export function getSafeNextPath(nextPath: string | null): string {
  if (
    !nextPath ||
    !nextPath.startsWith("/v2/") ||
    nextPath.includes("//") ||
    nextPath.includes("\\")
  ) {
    return "/v2/home";
  }

  return nextPath;
}

export function getAuthCallbackUrl(nextPath: string): string {
  const safeNextPath = getSafeNextPath(nextPath);
  return `${window.location.origin}/v2/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
}
