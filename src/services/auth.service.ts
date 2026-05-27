import { createRouterClient, routerLogin } from "./router.service";

/**
 * Login to the router with the given credentials.
 *
 * Returns the session token on success.
 * Throws a descriptive error on failure for the UI to display.
 */
export async function login(
  username: string,
  password: string
): Promise<string> {
  const client = createRouterClient();
  const result = await routerLogin(client, username, password);

  if (!result.success) {
    throw new Error(result.error.message);
  }

  if (!result.data.ubus_rpc_session) {
    throw new Error("Login failed: no session token returned");
  }

  return result.data.ubus_rpc_session;
}

/**
 * Client-side logout.
 *
 * This is a convenience wrapper — the caller is responsible for clearing
 * the stored token via useAuthStore.logout().
 */
export function logout(): void {
  // No client-side state to clear directly.
  // The calling code should call useAuthStore.logout() to reset the token.
}
