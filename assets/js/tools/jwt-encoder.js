import { createJwt, formatJson, base64UrlEncode } from '../core/jwt-utils.js';
import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row-inline">
    <div class="form-row">
      <label for="alg">Algorithm</label>
      <select id="alg">
        <option value="HS256">HS256</option>
        <option value="HS384">HS384</option>
        <option value="HS512">HS512</option>
      </select>
    </div>
    <div class="form-row">
      <label for="secret">Secret Key</label>
      <input type="text" id="secret" placeholder="your-256-bit-secret" value="your-256-bit-secret">
    </div>
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
const secret = document.getElementById('secret');
const headerEl = document.getElementById('header');
const payloadEl = document.getElementById('payload');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');
const tokenOut = document.getElementById('token-out');

alg.addEventListener('change', () => {
  try {
    const h = JSON.parse(headerEl.value);
    h.alg = alg.value;
    headerEl.value = formatJson(h);
  } catch { /* ignore */ }
});

document.getElementById('btn-encode').addEventListener('click', async () => {
  try {
    errorEl.classList.add('hidden');
    const header = JSON.parse(headerEl.value);
    const payload = JSON.parse(payloadEl.value);
    header.alg = alg.value;
    const token = await createJwt(header, payload, secret.value);
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
