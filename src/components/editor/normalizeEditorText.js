function mergeStyles(base = '', extra = '') {
  const map = new Map();
  const parse = (str) => {
    if (!str) return;
    str.split(';').forEach((pair) => {
      const [k, ...v] = pair.split(':');
      if (k && k.trim()) map.set(k.trim().toLowerCase(), v.join(':').trim());
    });
  };

  parse(base);
  parse(extra);

  return Array.from(map.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

const QUILL_STYLE_MAP = {
  'ql-align-center': 'text-align: center',
  'ql-align-right': 'text-align: right',
  'ql-align-justify': 'text-align: justify',
  'ql-font-serif': 'font-family: serif',
  'ql-font-monospace': 'font-family: monospace',
  'ql-size-small': 'font-size: 8px',
  'ql-size-large': 'font-size: 14px',
  'ql-size-huge': 'font-size: 18px',
  // Indentações (Padding acumulativo)
  'ql-indent-1': 'padding-left: 10px',
  'ql-indent-2': 'padding-left: 20px',
  'ql-indent-3': 'padding-left: 30px',
  'ql-indent-4': 'padding-left: 40px',
};

export function normalizeQuillLists(html) {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const { body } = doc;
  const newFrag = doc.createDocumentFragment();

  let listStack = [];

  const getLevel = (el) => {
    const match = el.className?.match(/ql-indent-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  Array.from(body.childNodes).forEach((node) => {
    if (node.nodeType !== 1 || !node.hasAttribute('data-list')) {
      listStack = [];
      newFrag.appendChild(node.cloneNode(true));
      return;
    }

    const level = getLevel(node);
    const type = node.getAttribute('data-list') === 'ordered' ? 'ol' : 'ul';
    const content = node.innerHTML.trim() || '&nbsp;';

    while (listStack.length > level + 1) {
      listStack.pop();
    }

    const li = doc.createElement('li');
    li.innerHTML = content;

    if (listStack[level] && listStack[level].tagName.toLowerCase() === type) {
      listStack[level].appendChild(li);
    } else {
      const newList = doc.createElement(type);
      newList.appendChild(li);

      if (level === 0) {
        newFrag.appendChild(newList);
      } else {
        const parentLi = listStack[level - 1]?.lastElementChild;
        if (parentLi) parentLi.appendChild(newList);
        else newFrag.appendChild(newList);
      }
      listStack[level] = newList;
    }
  });

  return Array.from(newFrag.childNodes)
    .map((n) => n.outerHTML || n.textContent)
    .join('');
}

export function processHtmlForPdf(htmlString, customStyleMap = {}) {
  if (!htmlString) return '';

  const normalizedHtml = normalizeQuillLists(htmlString);

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${normalizedHtml}</div>`, 'text/html');
  const container = doc.body.firstElementChild;

  container.querySelectorAll('.ql-ui').forEach((el) => el.remove());

  const elements = container.querySelectorAll('*');
  const styleMap = { ...QUILL_STYLE_MAP, ...customStyleMap };

  elements.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    let style = el.getAttribute('style') || '';

    el.classList.forEach((cls) => {
      if (styleMap[cls]) style = mergeStyles(style, styleMap[cls]);
    });

    if (['p', 'li', 'span', 'strong', 'em'].includes(tag)) {
      if (!style.includes('font-size')) style = mergeStyles(style, 'font-size: 10px');
      // if (!style.includes('line-height')) style = mergeStyles(style, 'line-height: 1.4');
    }

    if (tag === 'p') {
      style = mergeStyles(style, 'margin-bottom: 0px; margin-top: 0;');
      if (el.innerHTML.trim() === '' || el.innerHTML === '<br>') {
        el.innerHTML = '&nbsp;';
        style = mergeStyles(style, 'min-height: 12px');
      }
    }

    if (['ul', 'ol'].includes(tag)) {
      const listStyle = tag === 'ol' ? 'decimal' : 'disc';
      style = mergeStyles(style, `margin-bottom: 0px;margin-top: 0px; list-style-type: ${listStyle}`);
    }

    el.removeAttribute('class');
    el.removeAttribute('data-list');
    el.removeAttribute('contenteditable');

    if (style) el.setAttribute('style', style.trim());
  });

  return container.innerHTML;
}

export function formatPlainTextToHtml(text) {
  if (!text) return '';
  if (!text.includes('<')) return convertToParagraphs(text);
  const htmlRegex = /<(p|div|br|ul|ol|li|strong|em|span|h[1-6])\b[^>]*>/i;
  if (htmlRegex.test(text)) return text;
  return convertToParagraphs(text);
}

function convertToParagraphs(text) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmedLine = line.trim();
      return `<p>${trimmedLine || '&nbsp;'}</p>`;
    })
    .join('');
}
