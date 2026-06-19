import { parseJwt, formatJson, analyzeExpiry, getClaimDescription } from '../core/jwt-utils.js';
import { getTokenFromUrl, setTokenInUrl } from '../core/share.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">JWT Token</label>
    <textarea id="jwt-input" rows="4" placeholder="Paste JWT to debug…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-debug">Debug Token</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden"></div>
`;

const input = document.getElementById('jwt-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');

document.getElementById('btn-debug').addEventListener('click', () => {
  try {
    errorEl.classList.add('hidden');
    const { header, payload } = parseJwt(input.value);
    const expiry = analyzeExpiry(payload);

    let html = `<div class="alert ${expiry.warnings.length ? 'alert-warning' : 'alert-success'}">${expiry.warnings.length ? expiry.warnings.join(' · ') : 'No critical warnings'}</div>`;

    html += '<h3>Timeline</h3><div class="timeline">';
    if (payload.iat) html += `<div class="timeline-item"><span class="timeline-label">Issued (iat)</span><span class="timeline-value">${new Date(payload.iat * 1000).toISOString()}</span></div>`;
    if (payload.nbf) html += `<div class="timeline-item"><span class="timeline-label">Not Before</span><span class="timeline-value">${new Date(payload.nbf * 1000).toISOString()}</span></div>`;
    if (payload.exp) html += `<div class="timeline-item"><span class="timeline-label">Expires (exp)</span><span class="timeline-value ${expiry.isExpired ? 'claim-error' : ''}">${new Date(payload.exp * 1000).toISOString()}</span></div>`;
    html += `<div class="timeline-item"><span class="timeline-label">Now</span><span class="timeline-value">${new Date().toISOString()}</span></div></div>`;

    html += '<h3>Header</h3><pre class="output-block">' + formatJson(header) + '</pre>';
    html += '<h3>Claims</h3><table class="claims-table"><thead><tr><th>Claim</th><th>Value</th><th>Description</th></tr></thead><tbody>';

    for (const [key, value] of Object.entries(payload)) {
      const cls = key === 'exp' && expiry.isExpired ? 'claim-error' : '';
      html += `<tr><td><code>${key}</code></td><td class="${cls}">${typeof value === 'object' ? JSON.stringify(value) : value}</td><td>${getClaimDescription(key)}</td></tr>`;
    }
    html += '</tbody></table>';

    if (!header.alg) html += '<div class="alert alert-warning">Missing alg in header</div>';
    if (header.alg === 'none') html += '<div class="alert alert-danger">⚠ alg:none — security risk, reject this token</div>';

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
  if (ex) input.value = ex.value;
});

const urlToken = getTokenFromUrl();
if (urlToken) { input.value = urlToken; document.getElementById('btn-debug').click(); }
