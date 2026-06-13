const API_URL = "http://localhost:3001";

export async function apiFetch(
  endpoint: string,
  options?: RequestInit,
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token
          ? `Bearer ${token}`
          : "",
        ...(options?.headers || {}),
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Error inesperado",
    );
  }

  return data;
}