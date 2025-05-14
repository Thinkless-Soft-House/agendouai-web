const apiUrl = import.meta.env.VITE_API_URL || "";

export async function login(credentials: { email: string; password: string }) {
  const loginUrl = apiUrl.startsWith("http")
    ? `${apiUrl}/auth/login`
    : `http://${apiUrl}/auth/login`;

  console.log("[useAuth] Fazendo requisição de login:", {
    url: loginUrl,
    credentials,
  });

  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  console.log("[useAuth] Corpo da resposta:", data);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function logout() {
  const logoutUrl = apiUrl.startsWith("http")
    ? `${apiUrl}/auth/logout`
    : `http://${apiUrl}/auth/logout`;

  console.log("[useAuth] Fazendo requisição de logout:", {
    url: logoutUrl,
  });

  const response = await fetch(logoutUrl, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  console.log("[useAuth] Corpo da resposta:", data);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
