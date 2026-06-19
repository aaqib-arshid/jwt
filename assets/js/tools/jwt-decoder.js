import { parseJwt, formatJson, analyzeExpiry } from '../core/jwt-utils.js';
import { getTokenFromUrl, setTokenInUrl, getShareUrl } from '../core/share.js';
import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">Paste JWT Token</label>
    <textarea id="jwt-input" rows="4" placeholder="eyJhbGciOiJIUzI1NiIs…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-decode">Decode</button>
    <button type="button" class="btn btn-success" id="btn-copy-all">Copy All</button>
    <button type="button" class="btn btn-secondary" id="btn-share">Share URL</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden">
    <div class="tool-panel">
      <h3>Header <button type="button" class="btn btn-sm btn-success" id="btn-copy-header">Copy</button></h3>
      <pre class="output-block" id="out-header"></pre>
    </div>
    <div class="tool-panel">
      <h3>Payload <button type="button" class="btn btn-sm btn-success" id="btn-copy-payload">Copy</button></h3>
      <pre class="output-block" id="out-payload"></pre>
    </div>
    <div class="tool-panel">
      <h3>Signature <button type="button" class="btn btn-sm btn-success" id="btn-copy-sig">Copy</button></h3>
      <pre class="output-block" id="out-signature"></pre>
    </div>
    <div id="exp-info" class="alert alert-info hidden"></div>
  </div>
`;

const input = document.getElementById('jwt-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');

function decode() {
  try {
    errorEl.classList.add('hidden');
    const { header, payload, signature } = parseJwt(input.value);
    document.getElementById('out-header').textContent = formatJson(header);
    document.getElementById('out-payload').textContent = formatJson(payload);
    document.getElementById('out-signature').textContent = signature;
    outputEl.classList.remove('hidden');

    const exp = analyzeExpiry(payload);
    const expInfo = document.getElementById('exp-info');
    if (exp.expDate) {
      expInfo.classList.remove('hidden');
      expInfo.className = `alert ${exp.isExpired ? 'alert-warning' : 'alert-info'}`;
      expInfo.textContent = exp.isExpired
        ? `Expired: ${exp.expDate.toUTCString()}`
        : `Expires: ${exp.expDate.toUTCString()} (${Math.floor(exp.remainingSec / 60)} min remaining)`;
    }
    setTokenInUrl(input.value);
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
    outputEl.classList.add('hidden');
  }
}

document.getElementById('btn-decode').addEventListener('click', decode);
document.getElementById('btn-clear').addEventListener('click', () => {
  input.value = '';
  outputEl.classList.add('hidden');
  errorEl.classList.add('hidden');
  setTokenInUrl('');
});
document.getElementById('btn-copy-all').addEventListener('click', () => {
  const text = ['Header', document.getElementById('out-header').textContent, '', 'Payload', document.getElementById('out-payload').textContent, '', 'Signature', document.getElementById('out-signature').textContent].join('\n');
  copyToClipboard(text);
});
document.getElementById('btn-copy-header').addEventListener('click', () => copyToClipboard(document.getElementById('out-header').textContent));
document.getElementById('btn-copy-payload').addEventListener('click', () => copyToClipboard(document.getElementById('out-payload').textContent));
document.getElementById('btn-copy-sig').addEventListener('click', () => copyToClipboard(document.getElementById('out-signature').textContent));
document.getElementById('btn-share').addEventListener('click', () => copyToClipboard(getShareUrl(input.value)));

document.getElementById('load-example')?.addEventListener('click', () => {
  const ex = document.getElementById('example-token');
  if (ex) { input.value = ex.value; decode(); }
});

const urlToken = getTokenFromUrl();
if (urlToken) { input.value = urlToken; decode(); }
