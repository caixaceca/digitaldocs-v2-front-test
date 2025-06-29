import ReactQuill from 'react-quill-new';
// @mui
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
//
import EditorToolbar, { formats, redoChange, undoChange } from './EditorToolbar';

// ---------------------------------------------------------------------------------------------------------------------

const RootStyle = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${theme.palette.grey['500_32']}`,
  '& .ql-container.ql-snow': {
    borderColor: 'transparent',
    ...theme.typography.body1,
    fontFamily: theme.typography.fontFamily,
  },
  '& .ql-editor': {
    minHeight: 150,
    maxHeight: 500,
    '&.ql-blank::before': { fontStyle: 'normal', color: theme.palette.text.disabled },
    '& pre.ql-syntax': {
      ...theme.typography.body2,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.grey[900],
    },
  },
}));

// ---------------------------------------------------------------------------------------------------------------------

export default function Editor({
  sx,
  error,
  value,
  onChange,
  helperText,
  simple = false,
  id = 'intranet-quill',
  placeholder = 'Escreve uma mensagem...',
  ...other
}) {
  const modules = {
    syntax: true,
    clipboard: { matchVisual: false },
    history: { delay: 500, maxStack: 100, userOnly: true },
    toolbar: { container: `#${id}`, handlers: { undo: undoChange, redo: redoChange } },
  };

  return (
    <div>
      <RootStyle sx={{ ...(error && { border: (theme) => `solid 1px ${theme.palette.error.main}` }), ...sx }}>
        <EditorToolbar id={id} isSimple={simple} />
        <ReactQuill
          value={value}
          modules={modules}
          formats={formats}
          onChange={onChange}
          placeholder={placeholder}
          {...other}
        />
      </RootStyle>

      {helperText && helperText}
    </div>
  );
}
