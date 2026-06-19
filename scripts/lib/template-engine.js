/**
 * Lightweight mustache-style template engine.
 * Supports: {{var}}, {{nested.path}}, nested {{#each}}/{{#if}} blocks, {{{rawHtml}}}
 */

import { readFileSync } from 'fs';

function resolvePath(data, path) {
  if (!path) return undefined;
  return path.split('.').reduce((obj, key) => (obj != null ? obj[key] : undefined), data);
}

const OPEN_EACH = '{{#each';
const OPEN_IF = '{{#if';
const CLOSE_EACH = '{{/each}}';
const CLOSE_IF = '{{/if}}';

function findBlockEnd(template, innerStart) {
  let depth = 1;
  let pos = innerStart;

  while (pos < template.length) {
    const nextEach = template.indexOf(OPEN_EACH, pos);
    const nextIf = template.indexOf(OPEN_IF, pos);
    const nextCloseEach = template.indexOf(CLOSE_EACH, pos);
    const nextCloseIf = template.indexOf(CLOSE_IF, pos);

    const candidates = [
      nextEach,
      nextIf,
      nextCloseEach,
      nextCloseIf,
    ].filter(i => i !== -1);

    if (candidates.length === 0) return -1;

    const next = Math.min(...candidates);

    if (next === nextEach || next === nextIf) {
      depth++;
      pos = next + 2;
      continue;
    }

    if (next === nextCloseEach || next === nextCloseIf) {
      depth--;
      if (depth === 0) {
        return next;
      }
      pos = next + 2;
      continue;
    }
  }

  return -1;
}

function renderLeaf(template, data) {
  let result = template;

  result = result.replace(/\{\{\{([\w.]+)\}\}\}/g, (_, path) => {
    const val = resolvePath(data, path);
    return val ?? '';
  });

  result = result.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const val = resolvePath(data, path);
    return escapeHtml(String(val ?? ''));
  });

  return result;
}

export function render(template, data) {
  let output = '';
  let i = 0;

  while (i < template.length) {
    const idxEach = template.indexOf(OPEN_EACH, i);
    const idxIf = template.indexOf(OPEN_IF, i);

    let blockStart = -1;
    let blockType = null;

    if (idxEach === -1 && idxIf === -1) {
      output += renderLeaf(template.slice(i), data);
      break;
    }

    if (idxEach !== -1 && (idxIf === -1 || idxEach <= idxIf)) {
      blockStart = idxEach;
      blockType = 'each';
    } else {
      blockStart = idxIf;
      blockType = 'if';
    }

    output += renderLeaf(template.slice(i, blockStart), data);

    const openRe = blockType === 'each'
      ? /^\{\{#each\s+([\w.]+)\}\}/
      : /^\{\{#if\s+([\w.]+)\}\}/;

    const openMatch = template.slice(blockStart).match(openRe);
    if (!openMatch) {
      output += template.slice(blockStart, blockStart + 2);
      i = blockStart + 2;
      continue;
    }

    const path = openMatch[1];
    const innerStart = blockStart + openMatch[0].length;
    const closeStart = findBlockEnd(template, innerStart);

    if (closeStart === -1) {
      output += template.slice(blockStart);
      break;
    }

    const closeTag = blockType === 'each' ? CLOSE_EACH : CLOSE_IF;
    const inner = template.slice(innerStart, closeStart);

    if (blockType === 'each') {
      const items = resolvePath(data, path);
      if (Array.isArray(items)) {
        output += items.map((item, index) => {
          const ctx = typeof item === 'object'
            ? { ...data, ...item, index }
            : { ...data, this: item, index };
          return render(inner, ctx);
        }).join('');
      }
    } else if (resolvePath(data, path)) {
      output += render(inner, data);
    }

    i = closeStart + closeTag.length;
  }

  return output;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function loadTemplate(path) {
  return readFileSync(path, 'utf-8');
}
