export type ApiRecord = Record<string, unknown>;
export type ApiParams = Record<
  string,
  string | number | boolean | null | undefined
>;

function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default function createApiClient(baseUrl: string) {
  const basePath = baseUrl.replace(/\/$/, "");

  function buildQueryUrl(path: string, params: ApiParams = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value != null)
        .map(([key, value]) => [key, String(value)]),
    );
    console.log(filteredParams);
    const query = new URLSearchParams(filteredParams).toString();
    const normalizedPath = path.replace(/^\//, "");

    return `${basePath}/${normalizedPath}${query ? `?${query}` : ""}`;
  }

  async function fetchData(path: string, params: ApiParams = {}): Promise<ApiRecord[]> {
    const url = buildQueryUrl(path, params);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`[API error] ${response.status} — ${response.statusText}`);
    }

    const json: unknown = await response.json();

    if (!isApiRecord(json)) {
      throw new Error("[API error] Response was not a JSON object");
    }

    if (json.object === "error") {
      const code = typeof json.code === "string" ? json.code : "unknown";
      const details =
        typeof json.details === "string"
          ? json.details
          : typeof json.message === "string"
            ? json.message
            : "No details provided";
      throw new Error(`[API error] ${code} — ${details}`);
    }

    switch (json.object) {
      case "card":
        console.log(json);
        return [json];
      case "list":
      case "catalog":
        if (!Array.isArray(json.data) || !json.data.every(isApiRecord)) {
          throw new Error("[API error] List response did not contain object data");
        }
        console.log(json.data);
        return json.data;
      default:
        throw new Error(`[API Error] Unexpected response object: ${String(json.object)}`);
    }
  }

  return { fetchData };
}
