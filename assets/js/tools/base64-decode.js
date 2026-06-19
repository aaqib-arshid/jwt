import { base64UrlDecode, base64UrlEncode } from '../core/jwt-utils.js';
import { copyToClipboard } from '../core/ui.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="mode">Mode</label>
    <select id="mode">
      <option value="decode">Decode Base64URL</option>
      <option value="encode">Encode to Base64URL</option>
    </select>
  </div>
  <div class="form-row">
    <label for="input">Input</label>
    <textarea id="input" rows="4" placeholder="Paste Base64 or Base64URL string…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-convert">Convert</button>
    <button type="button" class="btn btn-success" id="btn-copy">Copy Output</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden">
    <label>Output</label>
    <textarea id="output" rows="6" readonly></textarea>
  </div>
`;

const mode = document.getElementById('mode');
const input = document.getElementById('input');
const output = document.getElementById('output');
const errorEl = document.getElementById('tool-error');
const outputWrap = document.getElementById('tool-output');

document.getElementById('btn-convert').addEventListener('click', () => {
  try {
    errorEl.classList.add('hidden');
    if (mode.value === 'decode') {
      output.value = base64UrlDecode(input.value.trim());
    } else {
      output.value = base64UrlEncode(input.value);
    }
    outputWrap.classList.remove('hidden');
  } catch (e) {
    errorEl.textContent = 'Decode failed: ' + e.message;
    errorEl.classList.remove('hidden');
  }
});

document.getElementById('btn-copy').addEventListener('click', () => copyToClipboard(output.value));
document.getElementById('btn-clear').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  outputWrap.classList.add('hidden');
});

document.getElementById('load-example')?.addEventListener('click', () => {
  input.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  mode.value = 'decode';
});
