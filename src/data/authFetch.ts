export function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = localStorage.getItem("codecraft_token");
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
