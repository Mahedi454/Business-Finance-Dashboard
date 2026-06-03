const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const AUTH_REQUIRED = "Authentication required";

type ApiOptions = RequestInit & {
  json?: unknown;
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.json ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    credentials: "include",
    body: options.json ? JSON.stringify(options.json) : options.body,
  }).catch(() => {
    throw new Error(`Backend API is not reachable at ${API_URL}. Start the backend server and check the API URL.`);
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Request failed" }));
    const message = payload.message ?? "Request failed";

    if (response.status === 401 && path !== "/api/auth/login" && typeof window !== "undefined") {
      window.location.assign("/login?session=expired");
      throw new Error(AUTH_REQUIRED);
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
