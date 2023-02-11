export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ----------------------------------------------------------------------

export function newLineText(text) {
  const newText = (
    <>
      {text.split('\n').map((str) => (
        <p key={str}>{str}</p>
      ))}
    </>
  );
  return newText;
}

// ----------------------------------------------------------------------

export function newHtmlText(text) {
  let newText = '';
  text.split('\n').forEach((str) => {
    newText = `${newText}<p><span style="font-family: NeoSansStd;">${str}</span></p>`;
  });
  return newText;
}
