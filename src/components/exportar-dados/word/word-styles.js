import { LevelFormat, AlignmentType } from 'docx';

export const styles = {
  default: {
    document: {
      run: { font: { name: 'Neo Sans Std' }, size: '11pt' },
      paragraph: { spacing: { line: '12pt' }, alignment: AlignmentType.JUSTIFIED },
    },
  },

  paragraphStyles: [
    { id: 'slogan', run: { color: '5aaa28', size: '9pt' } },
    { id: 'codificacao', run: { color: '5aaa28', size: '6pt' } },
    { id: 'titulo', run: { size: '12pt', bold: true } },
  ],
};

export function numberingFormat() {
  const config = [];

  [...Array(50)]?.forEach((row, index) => {
    config?.push({
      reference: `numeracao_${index}`,
      levels: [
        {
          level: 0,
          text: '%1.',
          alignment: AlignmentType.END,
          style: { paragraph: { indent: { left: 720, hanging: 260 } } },
        },
      ],
    });
    [...Array(50)]?.forEach((row, index1) => {
      config?.push({
        reference: `letra_${index}_${index1}`,
        levels: [
          {
            level: 0,
            text: '%1)',
            alignment: AlignmentType.CENTER,
            format: LevelFormat.LOWER_LETTER,
            style: { paragraph: { indent: { left: 1140, hanging: 300 } } },
          },
        ],
      });
    });
  });

  return { config };
}
