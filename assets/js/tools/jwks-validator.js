import { parseJwt, verifyHmac, fetchJwks } from '../core/jwt-utils.js';
import { getTokenFromUrl } from '../core/share.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">JWT Token</label>
    <textarea id="jwt-input" rows="4" placeholder="Paste RS256/RS512 JWT…"></textarea>
  </div>
  <div class="form-row">
    <label for="jwks-url">JWKS URL (optional — fetches public keys)</label>
    <input type="url" id="jwks-url" placeholder="https://issuer/.well-known/jwks.json">
  </div>
  <div class="form-row">
    <label for="public-key">Or paste JWK / PEM public key (JSON)</label>
    <textarea id="public-key" rows="4" placeholder='{"kty":"RSA","n":"…","e":"AQAB",…}'></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-validate">Validate with JWKS</button>
    <button type="button" class="btn btn-secondary" id="btn-fetch">Fetch JWKS</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden"></div>
`;

const input = document.getElementById('jwt-input');
const jwksUrl = document.getElementById('jwks-url');
const publicKey = document.getElementById('public-key');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');

document.getElementById('btn-fetch').addEventListener('click', async () => {
  try {
    errorEl.classList.add('hidden');
    const jwks = await fetchJwks(jwksUrl.value);
    publicKey.value = JSON.stringify(jwks, null, 2);
    outputEl.className = 'alert alert-info';
    outputEl.textContent = `Fetched ${jwks.keys?.length || 0} keys from JWKS endpoint`;
    outputEl.classList.remove('hidden');
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
  }
});

document.getElementById('btn-validate').addEventListener('click', async () => {
  try {
    errorEl.classList.add('hidden');
    const { header, parts } = parseJwt(input.value);
    const alg = header.alg;

    if (['HS256', 'HS384', 'HS512'].includes(alg)) {
      throw new Error('Use JWT Validator for HMAC algorithms');
    }

    let jwk;
    const jwksData = JSON.parse(publicKey.value || '{}');
    if (jwksData.keys) {
      const kid = header.kid;
      jwk = jwksData.keys.find(k => !kid || k.kid === kid) || jwksData.keys[0];
    } else {
      jwk = jwksData;
    }

    if (!jwk?.kty) throw new Error('No valid JWK found');

    const hash = alg === 'RS512' ? 'SHA-512' : alg === 'RS384' ? 'SHA-384' : 'SHA-256';
    const key = await crypto.subtle.importKey(
      'jwk', jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash },
      false, ['verify']
    );

    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const sigBin = atob(parts[2].replace(/-/g, '+').replace(/_/g, '/'));
    const sig = Uint8Array.from(sigBin, c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data);

    outputEl.className = `alert ${valid ? 'alert-success' : 'alert-danger'}`;
    outputEl.textContent = valid ? `✓ Signature valid (${alg}, kid: ${header.kid || 'n/a'})` : '✗ Invalid signature';
    outputEl.classList.remove('hidden');
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
    outputEl.classList.add('hidden');
  }
});

const urlToken = getTokenFromUrl();
if (urlToken) input.value = urlToken;
