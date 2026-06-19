/** Shareable URL with encoded token in query string */

export function getTokenFromUrl(param = 'token') {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(param);
  if (!encoded) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export function setTokenInUrl(token, param = 'token') {
  const url = new URL(window.location.href);
  if (token.trim()) {
    url.searchParams.set(param, encodeURIComponent(token.trim()));
  } else {
    url.searchParams.delete(param);
  }
  window.history.replaceState({}, '', url);
}

export function getShareUrl(token, param = 'token') {
  const url = new URL(window.location.href);
  url.searchParams.set(param, encodeURIComponent(token.trim()));
  return url.toString();
}

export function initShareFromUrl(param = 'token') {
  return getTokenFromUrl(param);
}
