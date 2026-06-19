/** Shared UI helpers */

export function showToast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 2000);
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
  showToast('Copied to clipboard');
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') node.className = v;
    else if (k === 'textContent') node.textContent = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else if (child) node.appendChild(child);
  }
  return node;
}

export function renderToolLayout(root, config) {
  root.innerHTML = '';
  root.append(
    el('div', { className: 'form-row' }, [
      el('label', { textContent: config.inputLabel || 'JWT Token' }),
      el('textarea', { id: 'jwt-input', rows: '4', placeholder: config.placeholder || 'Paste JWT here…' }),
    ]),
    el('div', { className: 'btn-group' }, config.buttons || []),
    el('div', { id: 'tool-error', className: 'alert alert-danger hidden' }),
    el('div', { id: 'tool-output', className: 'hidden' }),
  );
  return {
    input: root.querySelector('#jwt-input'),
    error: root.querySelector('#tool-error'),
    output: root.querySelector('#tool-output'),
  };
}

export function showError(errorEl, msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

export function hideError(errorEl) {
  errorEl.classList.add('hidden');
}

// Expose toast globally for inline onclick compatibility
window.JWTUI = { showToast, copyToClipboard };
