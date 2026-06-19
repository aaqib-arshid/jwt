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

/** JWS signing algorithms supported by the encoder (RFC 7518) */
export const SIGNING_ALGORITHMS = [
  { alg: 'HS256', family: 'hmac', hash: 'SHA-256', label: 'HS256 (HMAC-SHA256)' },
  { alg: 'HS384', family: 'hmac', hash: 'SHA-384', label: 'HS384 (HMAC-SHA384)' },
  { alg: 'HS512', family: 'hmac', hash: 'SHA-512', label: 'HS512 (HMAC-SHA512)' },
  { alg: 'RS256', family: 'rsa', hash: 'SHA-256', label: 'RS256 (RSA-SHA256)' },
  { alg: 'RS384', family: 'rsa', hash: 'SHA-384', label: 'RS384 (RSA-SHA384)' },
  { alg: 'RS512', family: 'rsa', hash: 'SHA-512', label: 'RS512 (RSA-SHA512)' },
  { alg: 'PS256', family: 'rsa-pss', hash: 'SHA-256', label: 'PS256 (RSA-PSS-SHA256)' },
  { alg: 'PS384', family: 'rsa-pss', hash: 'SHA-384', label: 'PS384 (RSA-PSS-SHA384)' },
  { alg: 'PS512', family: 'rsa-pss', hash: 'SHA-512', label: 'PS512 (RSA-PSS-SHA512)' },
  { alg: 'ES256', family: 'ecdsa', hash: 'SHA-256', curve: 'P-256', label: 'ES256 (ECDSA P-256)' },
  { alg: 'ES384', family: 'ecdsa', hash: 'SHA-384', curve: 'P-384', label: 'ES384 (ECDSA P-384)' },
  { alg: 'ES512', family: 'ecdsa', hash: 'SHA-512', curve: 'P-521', label: 'ES512 (ECDSA P-521)' },
  { alg: 'EdDSA', family: 'eddsa', curve: 'Ed25519', label: 'EdDSA (Ed25519)' },
];

const ALGO_MAP = Object.fromEntries(SIGNING_ALGORITHMS.map(a => [a.alg, a]));

const HASH_BYTES = { 'SHA-256': 32, 'SHA-384': 48, 'SHA-512': 64 };

export function getAlgorithmMeta(alg) {
  return ALGO_MAP[alg] || null;
}

export function isHmacAlgorithm(alg) {
  return ALGO_MAP[alg]?.family === 'hmac';
}

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  if (!b64) throw new Error('Invalid PEM: no key data found');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function importPrivateKeyPem(pem, meta) {
  const trimmed = pem.trim();
  if (!trimmed.includes('PRIVATE KEY')) {
    throw new Error('Paste a PEM private key (BEGIN PRIVATE KEY or BEGIN EC PRIVATE KEY)');
  }

  const keyData = pemToArrayBuffer(trimmed);

  if (meta.family === 'rsa') {
    return crypto.subtle.importKey(
      'pkcs8', keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: meta.hash },
      false, ['sign']
    );
  }
  if (meta.family === 'rsa-pss') {
    return crypto.subtle.importKey(
      'pkcs8', keyData,
      { name: 'RSA-PSS', hash: meta.hash },
      false, ['sign']
    );
  }
  if (meta.family === 'ecdsa') {
    return crypto.subtle.importKey(
      'pkcs8', keyData,
      { name: 'ECDSA', namedCurve: meta.curve },
      false, ['sign']
    );
  }
  if (meta.family === 'eddsa') {
    return crypto.subtle.importKey(
      'pkcs8', keyData,
      { name: 'Ed25519' },
      false, ['sign']
    );
  }
  throw new Error(`Unsupported algorithm family: ${meta.family}`);
}

export async function signJwt(alg, keyMaterial, data) {
  const meta = getAlgorithmMeta(alg);
  if (!meta) throw new Error(`Unsupported signing algorithm: ${alg}`);

  if (meta.family === 'hmac') {
    return signHmac(alg, keyMaterial, data);
  }

  let cryptoKey;
  try {
    cryptoKey = await importPrivateKeyPem(keyMaterial, meta);
  } catch (e) {
    throw new Error(`Private key import failed: ${e.message}. Use PKCS#8 PEM (BEGIN PRIVATE KEY).`);
  }

  let signature;
  if (meta.family === 'rsa') {
    signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      cryptoKey,
      new TextEncoder().encode(data)
    );
  } else if (meta.family === 'rsa-pss') {
    signature = await crypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: HASH_BYTES[meta.hash] },
      cryptoKey,
      new TextEncoder().encode(data)
    );
  } else if (meta.family === 'ecdsa') {
    signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: meta.hash },
      cryptoKey,
      new TextEncoder().encode(data)
    );
  } else if (meta.family === 'eddsa') {
    signature = await crypto.subtle.sign(
      'Ed25519',
      cryptoKey,
      new TextEncoder().encode(data)
    );
  }

  return bytesToBase64Url(new Uint8Array(signature));
}

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

export async function createJwt(header, payload, keyMaterial) {
  const alg = header.alg || 'HS256';
  const h = base64UrlEncode(JSON.stringify(header));
  const p = base64UrlEncode(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = await signJwt(alg, keyMaterial, data);
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
