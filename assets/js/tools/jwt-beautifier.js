import { parseJwt, formatJson } from '../core/jwt-utils.js';
import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">Paste JWT Token</label>
    <textarea id="jwt-input" rows="4" placeholder="eyJhbGciOiJIUzI1NiIs…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-beautify">Beautify</button>
    <button type="button" class="btn btn-success" id="btn-copy-all">Copy Formatted</button>
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
      <h3>Formatted Token</h3>
      <pre class="output-block" id="out-formatted"></pre>
    </div>
  </div>
`;

const input = document.getElementById('jwt-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');
let lastFormatted = '';

function beautify() {
  try {
    errorEl.classList.add('hidden');
    const { header, payload, parts } = parseJwt(input.value);
    const headerStr = formatJson(header);
    const payloadStr = formatJson(payload);
    document.getElementById('out-header').textContent = headerStr;
    document.getElementById('out-payload').textContent = payloadStr;
    lastFormatted = `HEADER:\n${headerStr}\n\nPAYLOAD:\n${payloadStr}\n\nSIGNATURE:\n${parts[2]}`;
    document.getElementById('out-formatted').textContent = lastFormatted;
    outputEl.classList.remove('hidden');
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.classList.remove('hidden');
    outputEl.classList.add('hidden');
  }
}

document.getElementById('btn-beautify').addEventListener('click', beautify);
document.getElementById('btn-copy-all').addEventListener('click', () => copyToClipboard(lastFormatted));
document.getElementById('btn-copy-header').addEventListener('click', () => copyToClipboard(document.getElementById('out-header').textContent));
document.getElementById('btn-copy-payload').addEventListener('click', () => copyToClipboard(document.getElementById('out-payload').textContent));
document.getElementById('btn-clear').addEventListener('click', () => { input.value = ''; outputEl.classList.add('hidden'); errorEl.classList.add('hidden'); });
input.addEventListener('input', () => { if (input.value.trim().includes('.')) beautify(); });
