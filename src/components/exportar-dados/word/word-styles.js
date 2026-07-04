import { AlignmentType } from 'docx';

export const createStyles = (runSize = '11pt') => ({
  default: {
    document: {
      run: { font: { name: 'Neo Sans Std' }, size: runSize },
      paragraph: {
        spacing: { line: '12pt' },
        alignment: AlignmentType.JUSTIFIED,
      },
    },
  },
  paragraphStyles: [
    { id: 'slogan', run: { color: '5aaa28', size: '9pt' } },
    { id: 'codificacao', run: { color: '5aaa28', size: '6pt' } },
    { id: 'titulo', run: { size: '12pt', bold: true } },
  ],
});

// ---- BUILDER INTERNO ------------------------------------------------------------------------------------------------

function build({ top, left = '12mm', right = '12mm', bottom, header, footer }) {
  return { page: { margin: { top, left, right, bottom, header, footer } } };
}

// ---- PRESETS --------------------------------------------------------------------------------------------------------

export const PAGE_FORMULARIO = build({
  top: '45mm',
  left: '12mm',
  right: '12mm',
  bottom: '35mm',
  header: '12mm',
  footer: '6mm',
});

// ---- BUILDER PÚBLICO ------------------------------------------------------------------------------------------------

export function buildPageProps(opts) {
  return build(opts);
}
