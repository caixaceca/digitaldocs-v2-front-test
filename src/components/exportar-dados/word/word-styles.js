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
