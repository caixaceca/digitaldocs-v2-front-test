const STYLE_MAP = {};

/**
 * Merge duas strings CSS "k:v; k2:v2" dando preferência ao segundo (override).
 */
function mergeStyleStrings(base = '', extra = '') {
  const map = {};
  base
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [k, ...rest] = pair.split(':');
      if (!k) return;
      map[k.trim()] = rest.join(':').trim();
    });
  extra
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [k, ...rest] = pair.split(':');
      if (!k) return;
      map[k.trim()] = rest.join(':').trim();
    });
  return Object.entries(map)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

/**
 * Remove nodes matching selector (ex.: spans .ql-ui) — evita conteúdo "vazio" que o Quill injeta.
 */
function removeQuillUIElements(doc) {
  try {
    const qlspans = doc.querySelectorAll('span.ql-ui');
    qlspans.forEach((s) => s.remove());
  } catch (e) {
    console.error(e);
  }
}

/**
 * Aplica inline styles a partir de classes definidas em styleMap.
 * Também limpa atributos Quill que atrapalham (data-list, contenteditable, class).
 *
 * @param {string} htmlString - HTML vindo do Quill (string).
 * @param {object} styleMap - map { className: "css: value; ..."}
 * @returns {string} HTML com estilos inline.
 */
export function inlineStylesFromClasses(htmlString, styleMap = STYLE_MAP) {
  if (!htmlString) return htmlString;

  // primeiro organiza listas
  htmlString = normalizeQuillLists(htmlString);

  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<body>${htmlString}</body>`, 'text/html');

  removeQuillUIElements(parsed);

  function applyToElement(el) {
    if (!el || el.nodeType !== 1) return;

    // limpar atributos inúteis
    if (el.hasAttribute('data-list')) el.removeAttribute('data-list');
    if (el.hasAttribute('contenteditable')) el.removeAttribute('contenteditable');

    // colectar classes
    const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    let existingStyle = el.getAttribute('style') || '';

    // aplicar estilos definidos para classes
    cls.forEach((cn) => {
      if (styleMap[cn]) existingStyle = mergeStyleStrings(existingStyle, styleMap[cn]);
      if (/^ql-indent-\d+$/.test(cn)) if (styleMap[cn]) existingStyle = mergeStyleStrings(existingStyle, styleMap[cn]);
    });

    // Font-size default para <p>, <li>, <strong>
    if (['p', 'li', 'strong'].includes(el.tagName.toLowerCase())) {
      const hasFontSize = /font-size\s*:/i.test(existingStyle);
      if (!hasFontSize) existingStyle = mergeStyleStrings(existingStyle, 'font-size: 10px;');
      else existingStyle = mergeStyleStrings('', 'font-size: 11px;');
    }

    // Margin zero para parágrafos e listas
    if (['p', 'ol', 'ul'].includes(el.tagName.toLowerCase())) {
      existingStyle = mergeStyleStrings(existingStyle, 'margin: 0; padding: 0;');
    }

    // limpar classes
    if (cls.length) el.removeAttribute('class');

    // aplicar estilo resultante
    if (existingStyle && existingStyle.trim()) el.setAttribute('style', existingStyle.trim());
    else if (el.hasAttribute('style')) el.removeAttribute('style');
  }

  const walker = parsed.createTreeWalker(parsed.body, NodeFilter.SHOW_ELEMENT, null, false);
  let node = walker.nextNode();
  while (node) {
    applyToElement(node);
    node = walker.nextNode();
  }

  return parsed.body.innerHTML;
}

// ---------------------------------------------------------------------------------------------------------------------

// organiza listas aninhando <li> do quill
export function normalizeQuillLists(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const { body } = doc;

  /**
   * Retorna o nível de indentação de um <li> dado (ql-indent-N).
   * Se não existir, retorna 0.
   */
  function getIndentLevel(li) {
    if (!li || !li.className) return 0;
    const m = String(li.className).match(/ql-indent-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /**
   * Decide o tipo de lista (<ol> ou <ul>) com base no atributo data-list do <li>.
   * Se data-list === 'ordered' => 'ol', caso contrário => 'ul'.
   */
  function listTypeFromLi(li) {
    return li && li.getAttribute('data-list') === 'ordered' ? 'ol' : 'ul';
  }

  // Seleciona todos os contêineres de lista (ol/ul) no body
  const listContainers = Array.from(body.querySelectorAll('ol,ul'));

  listContainers.forEach((origList) => {
    // Fragmento temporário para construir a(s) nova(s) lista(s)
    const frag = doc.createDocumentFragment();

    // Determina o tipo da lista raíz:
    // Se for <ol> originalmente, mas o primeiro <li> for bullet -> usa <ul>.
    const firstLi = Array.from(origList.children).find((n) => n.tagName === 'LI');
    let rootTag = 'ul';
    if (origList.tagName.toLowerCase() === 'ol')
      rootTag = firstLi && firstLi.getAttribute('data-list') === 'bullet' ? 'ul' : 'ol';
    else rootTag = firstLi && firstLi.getAttribute('data-list') === 'ordered' ? 'ol' : 'ul';

    // Arrays auxiliares para controlar a lista atual e o último <li> em cada nível
    const listsByLevel = [];
    const lastLiByLevel = [];

    // Cria a lista raiz e guarda na posição 0
    const currentRootList = doc.createElement(rootTag);
    frag.appendChild(currentRootList);
    listsByLevel[0] = currentRootList;
    lastLiByLevel[0] = null;

    // Obtém os <li> originais na ordem
    const originalLis = Array.from(origList.children).filter((n) => n.tagName === 'LI');

    originalLis.forEach((origLi) => {
      // Nível solicitado pelo Quill (ql-indent-N)
      let level = getIndentLevel(origLi);
      if (Number.isNaN(level) || level < 0) level = 0;

      // Se o nível indica um pai que ainda não existe, reduzimos até um nível válido
      while (level > 0 && !lastLiByLevel[level - 1]) {
        level -= 1;
      }

      // Tipo de lista esperado para este item (ol ou ul)
      const desiredType = listTypeFromLi(origLi);

      // Se não existe lista no nível atual ou o tipo não coincide, criamos nova lista
      if (!listsByLevel[level] || listsByLevel[level].tagName.toLowerCase() !== desiredType) {
        const newList = doc.createElement(desiredType);

        if (level === 0) {
          // Nível 0: adiciona-se como lista separada no fragmento (sibling)
          frag.appendChild(newList);
        } else {
          // Nível >0: aninha-se dentro do último <li> do nível anterior
          const parentLi = lastLiByLevel[level - 1];
          if (parentLi) parentLi.appendChild(newList);
          else frag.appendChild(newList);
        }

        // Guarda a referência da lista criada neste nível
        listsByLevel[level] = newList;

        // Quando criamos uma nova lista, qualquer estrutura mais profunda fica inválida:
        // limpamos referências de níveis superiores (serão recriadas quando necessário).
        for (let ii = level + 1; ii < listsByLevel.length; ii += 1) {
          listsByLevel[ii] = undefined;
          lastLiByLevel[ii] = undefined;
        }
      }

      // Criamos o novo <li> "limpo" e copiamos o conteúdo interno (mantendo spans ql-ui)
      const newLi = doc.createElement('li');
      newLi.innerHTML = origLi.innerHTML;

      // Anexa o <li> à lista do nível atual
      listsByLevel[level].appendChild(newLi);

      // Atualiza a referência do último <li> neste nível
      lastLiByLevel[level] = newLi;

      for (let ii = level + 1; ii < listsByLevel.length; ii += 1) {
        listsByLevel[ii] = undefined;
        lastLiByLevel[ii] = undefined;
      }
    });

    // Substitui a lista original pela nova estrutura normalizada
    origList.parentNode.replaceChild(frag, origList);
  });

  return body.innerHTML;
}
