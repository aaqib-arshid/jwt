import { parseJwt, analyzeExpiry } from '../core/jwt-utils.js';
import { getTokenFromUrl, setTokenInUrl } from '../core/share.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">JWT Token</label>
    <textarea id="jwt-input" rows="4" placeholder="Paste JWT to check expiration…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-check">Check Expiry</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-error" class="alert alert-danger hidden"></div>
  <div id="tool-output" class="hidden"></div>
`;

const input = document.getElementById('jwt-input');
const errorEl = document.getElementById('tool-error');
const outputEl = document.getElementById('tool-output');

function formatDuration(sec) {
  if (sec < 0) {
    const abs = Math.abs(sec);
    if (abs < 60) return `${abs} seconds ago`;
    if (abs < 3600) return `${Math.floor(abs / 60)} minutes ago`;
    if (abs < 86400) return `${Math.floor(abs / 3600)} hours ago`;
    return `${Math.floor(abs / 86400)} days ago`;
  }
  if (sec < 60) return `${sec} seconds remaining`;
  if (sec < 3600) return `${Math.floor(sec / 60)} minutes remaining`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours remaining`;
  return `${Math.floor(sec / 86400)} days remaining`;
}

document.getElementById('btn-check').addEventListener('click', () => {
  try {
    errorEl.classList.add('hidden');
    const { payload } = parseJwt(input.value);
    const exp = analyzeExpiry(payload);

    let html = '';
    if (!payload.exp) {
      html = '<div class="alert alert-warning"><strong>No exp claim</strong> — this token has no expiration date set.</div>';
    } else if (exp.isExpired) {
      html = `<div class="alert alert-danger"><strong>EXPIRED</strong><br>Expired: ${exp.expDate.toUTCString()}<br>${formatDuration(exp.remainingSec)}</div>`;
      html += '<p>Fix: <a href="/guides/jwt-expired-token-fix.html">JWT Expired Token Fix Guide</a></p>';
    } else {
      html = `<div class="alert alert-success"><strong>VALID</strong><br>Expires: ${exp.expDate.toUTCString()}<br>${formatDuration(exp.remainingSec)}</div>`;
    }

    if (exp.notYetValid) {
      html += '<div class="alert alert-warning">Token is not yet valid (nbf claim in future)</div>';
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

document.getElementById('load-example')?.addEventListener('click', () => {
  input.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleHBpcmVkLXVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0.4Adcj3UFYzPUVaY3F91aGW1-2x7wBW7Qga5U1q8q0YI';
});

const urlToken = getTokenFromUrl();
if (urlToken) input.value = urlToken;
