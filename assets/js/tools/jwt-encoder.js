import { createJwt, formatJson, SIGNING_ALGORITHMS, isHmacAlgorithm } from '../core/jwt-utils.js';
import { copyToClipboard } from '../core/ui.js';

const GROUPS = [
  { label: 'HMAC (symmetric)', family: 'hmac' },
  { label: 'RSA PKCS#1 v1.5', family: 'rsa' },
  { label: 'RSA-PSS', family: 'rsa-pss' },
  { label: 'ECDSA', family: 'ecdsa' },
  { label: 'EdDSA', family: 'eddsa' },
];

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row-inline">
    <div class="form-row">
      <label for="alg">Signing Algorithm</label>
      <select id="alg">
        ${GROUPS.map(g => `
          <optgroup label="${g.label}">
            ${SIGNING_ALGORITHMS.filter(a => a.family === g.family).map(a =>
              `<option value="${a.alg}">${a.label}</option>`
            ).join('')}
          </optgroup>
        `).join('')}
      </select>
    </div>
  </div>
  <div class="form-row" id="secret-row">
    <label for="secret">Secret Key</label>
    <input type="text" id="secret" placeholder="your-256-bit-secret" value="your-256-bit-secret">
    <p class="form-note" id="key-hint">Symmetric secret for HMAC signing.</p>
  </div>
  <div class="form-row hidden" id="private-key-row">
    <label for="private-key">Private Key (PEM)</label>
    <textarea id="private-key" rows="6" placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"></textarea>
    <p class="form-note">PKCS#8 PEM private key. Never share or upload — signing runs in your browser.</p>
  </div>
  <div class="form-row">
    <label for="header">Header (JSON)</label>
    <textarea id="header" rows="3">{"alg":"HS256","typ":"JWT"}</textarea>
  </div>
  <div class="form-row">
    <label for="payload">Payload (JSON)</label>
    <textarea id="payload" rows="6">{"sub":"1234567890","name":"John Doe","iat":1516239022,"exp":9999999999}</textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-encode">Generate JWT</button>
    <button type="button" class="btn btn-success" id="btn-copy">Copy Token</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden">
    <label>Generated Token</label>
    <textarea id="token-out" rows="4" readonly></textarea>
  </div>
`;

const alg = document.getElementById('alg');
const secretRow = document.getElementById('secret-row');
const privateKeyRow = document.getElementById('private-key-row');
const secret = document.getElementById('secret');
const privateKey = document.getElementById('private-key');
const keyHint = document.getElementById('key-hint');
const headerEl = document.getElementById('header');
const payloadEl = document.getElementById('payload');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');
const tokenOut = document.getElementById('token-out');

const KEY_HINTS = {
  hmac: 'Symmetric secret for HMAC signing (256+ bits recommended for HS256).',
  rsa: 'RSA private key in PKCS#8 PEM format for RS256/384/512.',
  'rsa-pss': 'RSA private key in PKCS#8 PEM format for PS256/384/512.',
  ecdsa: 'EC private key in PKCS#8 PEM format (P-256, P-384, or P-521).',
  eddsa: 'Ed25519 private key in PKCS#8 PEM format.',
};

function updateKeyFields() {
  const useHmac = isHmacAlgorithm(alg.value);
  secretRow.classList.toggle('hidden', !useHmac);
  privateKeyRow.classList.toggle('hidden', useHmac);

  const meta = SIGNING_ALGORITHMS.find(a => a.alg === alg.value);
  if (meta) keyHint.textContent = KEY_HINTS[meta.family] || '';

  try {
    const h = JSON.parse(headerEl.value);
    h.alg = alg.value;
    headerEl.value = formatJson(h);
  } catch { /* ignore invalid JSON while typing */ }
}

alg.addEventListener('change', updateKeyFields);

document.getElementById('btn-encode').addEventListener('click', async () => {
  try {
    errorEl.classList.add('hidden');
    const header = JSON.parse(headerEl.value);
    const payload = JSON.parse(payloadEl.value);
    header.alg = alg.value;

    const keyMaterial = isHmacAlgorithm(alg.value)
      ? secret.value
      : privateKey.value;

    if (!keyMaterial?.trim()) {
      throw new Error(isHmacAlgorithm(alg.value)
        ? 'Enter a secret key'
        : 'Paste your PEM private key');
    }

    const token = await createJwt(header, payload, keyMaterial);
    tokenOut.value = token;
    outputEl.classList.remove('hidden');
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
  }
});

document.getElementById('btn-copy').addEventListener('click', () => copyToClipboard(tokenOut.value));

document.getElementById('load-example')?.addEventListener('click', () => {
  payloadEl.value = formatJson({ sub: '1234567890', name: 'John Doe', iat: 1516239022, exp: 9999999999, iss: 'example.com' });
});

updateKeyFields();
