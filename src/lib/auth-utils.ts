export function setAuthCookie(token: string) {
  const expires = new Date();
  expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
  document.cookie = `aims_session=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

export function clearAuthCookie() {
  document.cookie = "aims_session=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
}
