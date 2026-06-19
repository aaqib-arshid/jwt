import { parseJwt, getClaimDescription, analyzeExpiry, formatJson } from '../core/jwt-utils.js';
import { getTokenFromUrl, setTokenInUrl } from '../core/share.js';
import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');
root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">JWT Token</label>
    <textarea id="jwt-input" rows="4" placeholder="Paste JWT to view claims…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-view">View Claims</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden"></div>
`;

const input = document.getElementById('jwt-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');

const REGISTERED = new Set(['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti']);

document.getElementById('btn-view').addEventListener('click', () => {
  try {
    errorEl.classList.add('hidden');
    const { header, payload } = parseJwt(input.value);
    const expiry = analyzeExpiry(payload);

    let html = `<div class="alert alert-info"><strong>Algorithm:</strong> ${header.alg || 'unknown'} · <strong>Type:</strong> ${header.typ || 'JWT'}${header.kid ? ` · <strong>kid:</strong> ${header.kid}` : ''}</div>`;
    html += '<table class="claims-table"><thead><tr><th>Claim</th><th>Type</th><th>Value</th><th>Description</th><th>Status</th></tr></thead><tbody>';

    for (const [key, value] of Object.entries(payload)) {
      const type = REGISTERED.has(key) ? 'Registered' : 'Custom';
      const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
      let status = '—';
      let cls = '';
      if (key === 'exp') {
        status = expiry.isExpired ? '⚠ Expired' : '✓ Valid';
        cls = expiry.isExpired ? 'claim-error' : 'claim-ok';
      }
      if (key === 'nbf' && expiry.notYetValid) { status = '⚠ Not yet valid'; cls = 'claim-warn'; }
      html += `<tr><td><code>${key}</code></td><td>${type}</td><td class="${cls}">${val}</td><td>${getClaimDescription(key)}</td><td class="${cls}">${status}</td></tr>`;
    }
    html += '</tbody></table>';
    html += `<details class="faq-item" style="margin-top:1rem"><summary>Raw payload JSON</summary><pre class="output-block">${formatJson(payload)}</pre></details>`;

    outputEl.innerHTML = html;
    outputEl.classList.remove('hidden');
    setTokenInUrl(input.value);
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
    outputEl.classList.add('hidden');
  }
});

document.getElementById('btn-clear').addEventListener('click', () => {
  input.value = '';
  outputEl.classList.add('hidden');
  errorEl.classList.add('hidden');
});

document.getElementById('load-example')?.addEventListener('click', () => {
  const ex = document.getElementById('example-token');
  if (ex) { input.value = ex.value; document.getElementById('btn-view').click(); }
});

const urlToken = getTokenFromUrl();
if (urlToken) { input.value = urlToken; document.getElementById('btn-view').click(); }
