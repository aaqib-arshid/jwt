import { parseJwt, formatJson, analyzeExpiry } from '../core/jwt-utils.js';

const root = document.getElementById('tool-root');

root.innerHTML = `
  <div class="form-row">
    <label for="jwt-input">Paste JWT Tokens (one per line)</label>
    <textarea id="jwt-input" rows="6" placeholder="eyJhbGci…&#10;eyJhbGci…"></textarea>
  </div>
  <div class="btn-group">
    <button type="button" class="btn btn-primary" id="btn-decode">Decode All</button>
    <button type="button" class="btn btn-secondary" id="btn-clear">Clear</button>
  </div>
  <div id="tool-summary" class="alert alert-info hidden"></div>
  <div id="tool-results"></div>
`;

const input = document.getElementById('jwt-input');
const resultsEl = document.getElementById('tool-results');
const summaryEl = document.getElementById('tool-summary');

function decodeAll() {
  const lines = input.value.split('\n').map(l => l.trim()).filter(Boolean);
  resultsEl.innerHTML = '';
  let ok = 0, fail = 0;

  lines.forEach((line, i) => {
    const card = document.createElement('div');
    card.className = 'card bulk-result';
    try {
      const { header, payload } = parseJwt(line);
      const exp = analyzeExpiry(payload);
      ok++;
      card.innerHTML = `
        <h3>Token #${i + 1} ${exp.isExpired ? '<span class="claim-error">(expired)</span>' : exp.expDate ? '<span class="claim-ok">(valid)</span>' : ''}</h3>
        <p><strong>alg:</strong> ${header.alg || '—'} · <strong>sub:</strong> ${payload.sub ?? '—'} · <strong>iss:</strong> ${payload.iss ?? '—'}</p>
        <details>
          <summary>Header & Payload</summary>
          <pre class="output-block">${formatJson(header)}\n\n${formatJson(payload)}</pre>
        </details>
      `;
    } catch (e) {
      fail++;
      card.innerHTML = `<h3>Token #${i + 1} <span class="claim-error">Error</span></h3><p class="alert alert-danger">${e.message}</p>`;
    }
    resultsEl.appendChild(card);
  });

  summaryEl.textContent = `Decoded ${ok} token(s)${fail ? `, ${fail} failed` : ''} of ${lines.length} total.`;
  summaryEl.classList.remove('hidden');
}

document.getElementById('btn-decode').addEventListener('click', decodeAll);
document.getElementById('btn-clear').addEventListener('click', () => { input.value = ''; resultsEl.innerHTML = ''; summaryEl.classList.add('hidden'); });
