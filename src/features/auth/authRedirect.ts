export const defaultAuthDestination = "/v2/home";

export function getSafeAuthDestination(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/v2/") ||
    value.includes("//") ||
    value.includes("\\")
  ) {
    return defaultAuthDestination;
  }

  try {
    const destination = new URL(value, window.location.origin);
    const decodedPath = decodeURIComponent(destination.pathname);

    if (
      destination.origin !== window.location.origin ||
      !decodedPath.startsWith("/v2/") ||
      decodedPath.includes("//") ||
      decodedPath.includes("\\")
    ) {
      return defaultAuthDestination;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return defaultAuthDestination;
  }
}

export function getAuthCallbackUrl(next: string): string {
  const callbackUrl = new URL("/v2/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", next);
  return callbackUrl.toString();
}
