import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');
root.innerHTML = `
  <div class="form-row">
    <label for="pem-input">RSA Public Key (PEM format)</label>
    <textarea id="pem-input" rows="8" placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...&#10;-----END PUBLIC KEY-----"></textarea>
  </div>
  <div class="form-row-inline">
    <div class="form-row">
      <label for="kid">Key ID (kid) — optional</label>
      <input type="text" id="kid" placeholder="key-1">
    </div>
    <div class="form-row">
      <label for="use">Use</label>
      <select id="use"><option value="sig">sig (signature)</option><option value="enc">enc (encryption)</option></select>
    </div>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-convert">Convert to JWK</button>
    <button type="button" class="btn btn-success" id="btn-copy">Copy JWK</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden">
    <label>JWK Output</label>
    <textarea id="jwk-out" rows="10" readonly></textarea>
    <p class="form-note">Use this JWK with our <a href="/tools/jwks-validator.html">JWKS Validator</a> to verify RS256 tokens.</p>
  </div>
`;

const pemInput = document.getElementById('pem-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');
const jwkOut = document.getElementById('jwk-out');

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/-----BEGIN RSA PUBLIC KEY-----/g, '')
    .replace(/-----END RSA PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

document.getElementById('btn-convert').addEventListener('click', async () => {
  try {
    errorEl.classList.add('hidden');
    const pem = pemInput.value.trim();
    if (!pem.includes('PUBLIC KEY')) throw new Error('Paste a valid PEM public key (BEGIN PUBLIC KEY)');

    const keyData = pemToArrayBuffer(pem);
    const cryptoKey = await crypto.subtle.importKey(
      'spki', keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      true, ['verify']
    );

    const jwk = await crypto.subtle.exportKey('jwk', cryptoKey);
    jwk.use = document.getElementById('use').value;
    jwk.alg = 'RS256';
    jwk.key_ops = ['verify'];
    const kid = document.getElementById('kid').value.trim();
    if (kid) jwk.kid = kid;

    jwkOut.value = JSON.stringify(jwk, null, 2);
    outputEl.classList.remove('hidden');
  } catch (e) {
    errorEl.textContent = 'Conversion failed: ' + e.message;
    errorEl.classList.remove('hidden');
    outputEl.classList.add('hidden');
  }
});

document.getElementById('btn-copy').addEventListener('click', () => copyToClipboard(jwkOut.value));
