import { parseJwt, formatJson, analyzeExpiry, getClaimDescription } from '../core/jwt-utils.js';
import { getTokenFromUrl, setTokenInUrl } from '../core/share.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">OAuth / OIDC Token</label>
    <textarea id="jwt-input" rows="4" placeholder="Paste access token or ID token…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-inspect">Inspect Token</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden"></div>
`;

const input = document.getElementById('jwt-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');

const OAUTH_CLAIMS = ['iss', 'sub', 'aud', 'exp', 'iat', 'scope', 'client_id', 'azp', 'nonce', 'auth_time', 'acr', 'amr'];

document.getElementById('btn-inspect').addEventListener('click', () => {
  try {
    errorEl.classList.add('hidden');
    const token = input.value.trim();
    if (token.split('.').length !== 3) {
      throw new Error('Token does not appear to be a JWT. OAuth tokens may be opaque strings.');
    }

    const { header, payload } = parseJwt(input.value);
    const expiry = analyzeExpiry(payload);

    const tokenType = payload.nonce || payload.auth_time ? 'OpenID Connect ID Token' : 'OAuth 2.0 Access Token (JWT format)';

    let html = `<div class="alert alert-info"><strong>Token Type:</strong> ${tokenType}</div>`;
    html += `<div class="alert ${expiry.isExpired ? 'alert-warning' : 'alert-success'}">${expiry.isExpired ? 'Token expired' : 'Token not expired'}</div>`;

    html += '<h3>OAuth/OIDC Claims</h3><table class="claims-table"><thead><tr><th>Claim</th><th>Value</th><th>Notes</th></tr></thead><tbody>';

    for (const claim of OAUTH_CLAIMS) {
      if (payload[claim] !== undefined) {
        html += `<tr><td><code>${claim}</code></td><td>${payload[claim]}</td><td>${getClaimDescription(claim)}</td></tr>`;
      }
    }

    for (const [key, value] of Object.entries(payload)) {
      if (!OAUTH_CLAIMS.includes(key)) {
        html += `<tr><td><code>${key}</code></td><td>${typeof value === 'object' ? JSON.stringify(value) : value}</td><td>Custom claim</td></tr>`;
      }
    }
    html += '</tbody></table>';

    html += '<h3>Header</h3><pre class="output-block">' + formatJson(header) + '</pre>';
    html += '<h3>Full Payload</h3><pre class="output-block">' + formatJson(payload) + '</pre>';

    if (payload.scope) {
      html += `<div class="alert alert-info"><strong>Scopes:</strong> ${payload.scope.split(' ').map(s => `<code>${s}</code>`).join(' ')}</div>`;
    }

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

const urlToken = getTokenFromUrl();
if (urlToken) input.value = urlToken;
