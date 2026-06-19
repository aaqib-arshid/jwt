/** JWT parsing, encoding, and crypto utilities — client-side only */

export function base64UrlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const binary = atob(s);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function parseJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: must have 3 segments (header.payload.signature)');
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload, signature: parts[2], parts };
}

export function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

export function getClaimDescription(claim) {
  const map = {
    iss: 'Issuer — who created the token',
    sub: 'Subject — user or entity ID',
    aud: 'Audience — intended recipient',
    exp: 'Expiration time (Unix timestamp)',
    nbf: 'Not valid before (Unix timestamp)',
    iat: 'Issued at (Unix timestamp)',
    jti: 'JWT ID — unique identifier',
    scope: 'OAuth scopes granted',
    azp: 'Authorized party (OAuth client ID)',
  };
  return map[claim] || 'Custom claim';
}

export function analyzeExpiry(payload) {
  const now = Math.floor(Date.now() / 1000);
  const result = { now, warnings: [] };

  if (payload.exp) {
    result.exp = payload.exp;
    result.expDate = new Date(payload.exp * 1000);
    result.isExpired = payload.exp < now;
    result.remainingSec = payload.exp - now;
    if (result.isExpired) result.warnings.push('Token is expired (exp claim)');
    else if (result.remainingSec < 300) result.warnings.push('Token expires in less than 5 minutes');
  } else {
    result.warnings.push('No exp claim — token has no expiration');
  }

  if (payload.nbf && payload.nbf > now) {
    result.notYetValid = true;
    result.warnings.push('Token is not yet valid (nbf claim)');
  }

  return result;
}

const HMAC_ALGOS = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
};

export async function signHmac(alg, secret, data) {
  const hash = HMAC_ALGOS[alg];
  if (!hash) throw new Error(`Unsupported algorithm: ${alg}`);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(sig)));
}

export async function verifyHmac(alg, secret, data, signature) {
  const expected = await signHmac(alg, secret, data);
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function createJwt(header, payload, secret) {
  const alg = header.alg || 'HS256';
  const h = base64UrlEncode(JSON.stringify(header));
  const p = base64UrlEncode(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = await signHmac(alg, secret, data);
  return `${data}.${sig}`;
}

export async function fetchJwks(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.status}`);
  return res.json();
}

export function jwkToCryptoKey(jwk) {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

export async function verifyRsa(token, publicKeyJwk) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const data = `${parts[0]}.${parts[1]}`;
  const sig = Uint8Array.from(base64UrlDecode(parts[2]), c => c.charCodeAt(0));
  const key = await jwkToCryptoKey(publicKeyJwk);
  const alg = JSON.parse(base64UrlDecode(parts[0])).alg;
  const hash = alg === 'RS512' ? 'SHA-512' : 'SHA-256';
  const verifyKey = await crypto.subtle.importKey(
    'jwk', publicKeyJwk,
    { name: 'RSASSA-PKCS1-v1_5', hash },
    false, ['verify']
  );
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', verifyKey, sig, new TextEncoder().encode(data));
}
