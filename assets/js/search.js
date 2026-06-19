let index = null;
let debounceTimer = null;

const TYPE_LABELS = {
  tool: 'Tool', guide: 'Guide', error: 'Error', algorithm: 'Algorithm',
  compare: 'Compare', claim: 'Claim', provider: 'Provider', glossary: 'Glossary',
  learn: 'Learn', hub: 'Hub', blog: 'Blog', page: 'Page',
};

async function loadIndex() {
  if (index) return index;
  try {
    const res = await fetch('/assets/search-index.json');
    index = await res.json();
  } catch {
    index = [];
  }
  return index;
}

function score(item, query) {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  let s = 0;
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const kw = (item.keywords || '').toLowerCase();
  for (const t of terms) {
    if (title.includes(t)) s += 10;
    if (title.startsWith(t)) s += 5;
    if (desc.includes(t)) s += 3;
    if (kw.includes(t)) s += 4;
  }
  if (item.type === 'tool') s += 2;
  return s;
}

function renderResults(results, container) {
  if (!results.length) {
    container.innerHTML = '<div class="search-empty">No results found</div>';
    container.classList.remove('hidden');
    return;
  }
  container.innerHTML = results.slice(0, 8).map(r => `
    <a href="${r.path}" class="search-result" role="option">
      <span class="search-result-type">${TYPE_LABELS[r.type] || 'Page'}</span>
      <span class="search-result-title">${r.title}</span>
      <span class="search-result-desc">${r.description?.slice(0, 80) || ''}</span>
    </a>
  `).join('');
  container.classList.remove('hidden');
}

function initSearch() {
  const input = document.getElementById('site-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const q = input.value.trim();
      if (q.length < 2) {
        results.classList.add('hidden');
        return;
      }
      const data = await loadIndex();
      const matched = data
        .map(item => ({ ...item, _score: score(item, q) }))
        .filter(item => item._score > 0)
        .sort((a, b) => b._score - a._score);
      renderResults(matched, results);
    }, 150);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      results.classList.add('hidden');
      input.blur();
    }
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) window.location.href = `/resources.html?q=${encodeURIComponent(q)}`;
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#site-search-wrap')) results.classList.add('hidden');
  });
}

function initResourcesFilter() {
  const input = document.getElementById('resources-filter');
  if (!input) return;

  const items = [...document.querySelectorAll('.resources-item')];
  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get('q');
  if (initialQ) input.value = initialQ;

  function filter() {
    const q = input.value.toLowerCase().trim();
    items.forEach(el => {
      const text = el.textContent.toLowerCase();
      el.classList.toggle('hidden', q.length > 0 && !text.includes(q));
    });
  }

  input.addEventListener('input', filter);
  filter();
}

initSearch();
initResourcesFilter();
