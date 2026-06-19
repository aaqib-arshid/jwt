import { parseJwt, verifyHmac } from '../core/jwt-utils.js';
import { getTokenFromUrl, setTokenInUrl } from '../core/share.js';
import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">JWT Token</label>
    <textarea id="jwt-input" rows="4" placeholder="Paste JWT to validate…"></textarea>
  </div>
  <div class="form-row">
    <label for="secret">Secret / Key</label>
    <input type="text" id="secret" placeholder="HMAC secret for HS256/384/512" value="your-256-bit-secret">
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-validate">Validate Signature</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-result" class="hidden"></div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
`;

const input = document.getElementById('jwt-input');
const secret = document.getElementById('secret');
const resultEl = document.getElementById('tool-result');
const errorEl = document.getElementById('tool-error');

document.getElementById('btn-validate').addEventListener('click', async () => {
  try {
    errorEl.classList.add('hidden');
    const { header, parts } = parseJwt(input.value);
    const alg = header.alg;

    if (!['HS256', 'HS384', 'HS512'].includes(alg)) {
      throw new Error(`Algorithm ${alg} requires JWKS Validator for RSA/EC keys`);
    }

    const data = `${parts[0]}.${parts[1]}`;
    const valid = await verifyHmac(alg, secret.value, data, parts[2]);

    resultEl.classList.remove('hidden');
    resultEl.className = `alert ${valid ? 'alert-success' : 'alert-danger'}`;
    resultEl.textContent = valid
      ? `✓ Signature valid (${alg})`
      : `✗ Invalid signature — check secret and algorithm`;
    setTokenInUrl(input.value);
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
  }
});

document.getElementById('btn-clear').addEventListener('click', () => {
  input.value = '';
  resultEl.classList.add('hidden');
  errorEl.classList.add('hidden');
});

document.getElementById('load-example')?.addEventListener('click', () => {
  const ex = document.getElementById('example-token');
  if (ex) input.value = ex.value;
});

const urlToken = getTokenFromUrl();
if (urlToken) input.value = urlToken;
