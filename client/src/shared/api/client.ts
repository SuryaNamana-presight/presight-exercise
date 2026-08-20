export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(path, {
    signal,
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(
      body?.message || "Unable to load data.",
      response.status,
    );
  }
  return response.json() as Promise<T>;
}


export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(
      body?.message || "Unable to complete the request.",
      response.status,
    );
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}
