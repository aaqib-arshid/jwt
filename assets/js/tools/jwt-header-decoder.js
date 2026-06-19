import { parseJwt, formatJson, base64UrlDecode } from '../core/jwt-utils.js';
import { getTokenFromUrl, setTokenInUrl } from '../core/share.js';
import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');
root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">JWT Token (or header segment only)</label>
    <textarea id="jwt-input" rows="3" placeholder="Paste full JWT or header segment…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-decode">Decode Header</button>
    <button type="button" class="btn btn-success" id="btn-copy">Copy Header JSON</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden">
    <h3>Decoded Header</h3>
    <pre class="output-block" id="out-header"></pre>
    <div id="alg-warn" class="hidden"></div>
  </div>
`;

const input = document.getElementById('jwt-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');
const outHeader = document.getElementById('out-header');
const algWarn = document.getElementById('alg-warn');

function decodeHeader() {
  try {
    errorEl.classList.add('hidden');
    let header;
    const raw = input.value.trim();
    if (raw.includes('.')) {
      header = parseJwt(raw).header;
    } else {
      header = JSON.parse(base64UrlDecode(raw));
    }
    outHeader.textContent = formatJson(header);
    outputEl.classList.remove('hidden');

    algWarn.className = 'alert alert-warning hidden';
    if (header.alg === 'none') {
      algWarn.className = 'alert alert-danger';
      algWarn.textContent = '⚠ Security warning: alg is "none" — reject tokens with this algorithm';
      algWarn.classList.remove('hidden');
    } else if (!header.alg) {
      algWarn.className = 'alert alert-warning';
      algWarn.textContent = '⚠ Missing alg claim in header';
      algWarn.classList.remove('hidden');
    }

    if (raw.includes('.')) setTokenInUrl(raw);
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
    outputEl.classList.add('hidden');
  }
}

document.getElementById('btn-decode').addEventListener('click', decodeHeader);
document.getElementById('btn-copy').addEventListener('click', () => copyToClipboard(outHeader.textContent));
document.getElementById('btn-clear').addEventListener('click', () => {
  input.value = '';
  outputEl.classList.add('hidden');
  errorEl.classList.add('hidden');
});

document.getElementById('load-example')?.addEventListener('click', () => {
  const ex = document.getElementById('example-token');
  if (ex) { input.value = ex.value; decodeHeader(); }
});

const urlToken = getTokenFromUrl();
if (urlToken) { input.value = urlToken; decodeHeader(); }
