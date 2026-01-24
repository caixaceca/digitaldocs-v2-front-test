import ReactMarkdown from 'react-markdown';
// markdown plugins
import rehypeRaw from 'rehype-raw';
// @mui
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
//
import Image from './Image';

// ---------------------------------------------------------------------------------------------------------------------

const MarkdownStyle = styled('div')(({ theme }) => {
  const isLight = theme.palette.mode === 'light';

  return {
    // Segurança para evitar que o texto ultrapasse o container
    wordBreak: 'break-word',
    overflowWrap: 'break-word',

    // Listas UL normais
    '& ul': {
      ...theme.typography.body1,
      paddingLeft: theme.spacing(5),
      listStyleType: 'disc',
      '& li': { lineHeight: 2 },
    },

    // Listas OL normais
    '& ol': {
      ...theme.typography.body1,
      paddingLeft: theme.spacing(5),
      listStyleType: 'decimal',
      '& li': { lineHeight: 2 },
    },

    // Caso o Quill coloque o atributo no <li> (ex.: <li data-list="bullet">), converte visualmente
    '& ol li[data-list="bullet"]': {
      listStyleType: 'disc !important',
      display: 'list-item',
      marginLeft: theme.spacing(0),
      paddingLeft: theme.spacing(0),
    },

    // Se Quill usar data-list no próprio OL
    '& ol[data-list="bullet"]': { listStyleType: 'disc !important' },

    // Remove os spans de UI que o Quill injeta
    '& span.ql-ui': { display: 'none !important' },

    // Caso existam bullets "checked"/"unchecked"
    '& li[data-list="checked"], & li[data-list="unchecked"]': {
      listStyleType: 'none',
      '&::before': { content: '""' },
      display: 'flex',
      alignItems: 'center',
    },
    '& li[data-list="checked"]::before': {
      content: '"\\2713\\00a0"', // ✓
      marginRight: theme.spacing(1),
      fontSize: '0.9em',
    },
    '& li[data-list="unchecked"]::before': {
      content: '"\\25A1\\00a0"', // □
      marginRight: theme.spacing(1),
      fontSize: '0.9em',
    },

    // Blockquote
    '& blockquote': {
      lineHeight: 1.5,
      fontSize: '1.5em',
      margin: '40px auto',
      position: 'relative',
      fontFamily: 'Georgia, serif',
      padding: theme.spacing(3, 3, 3, 8),
      borderRadius: Number(theme.shape.borderRadius) * 2,
      backgroundColor: theme.palette.background.neutral,
      color: `${theme.palette.text.secondary} !important`,
      [theme.breakpoints.up('md')]: {
        width: '80%',
      },
      '& p, & span': {
        marginBottom: '0 !important',
        fontSize: 'inherit !important',
        fontFamily: 'Georgia, serif !important',
        color: `${theme.palette.text.secondary} !important`,
      },
      '&:before': {
        left: 16,
        top: -8,
        display: 'block',
        fontSize: '3em',
        content: '"\\201C"',
        position: 'absolute',
        color: theme.palette.text.disabled,
      },
    },

    '& pre, & pre > code': {
      fontSize: 16,
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      padding: theme.spacing(2),
      color: theme.palette.common.white,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: isLight ? theme.palette.grey[900] : theme.palette.grey['500_16'],
    },
    '& code': {
      fontSize: 14,
      borderRadius: 4,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      padding: theme.spacing(0.2, 0.5),
      color: theme.palette.warning[isLight ? 'darker' : 'lighter'],
      backgroundColor: theme.palette.warning[isLight ? 'lighter' : 'darker'],
      '&.hljs': { padding: 0, backgroundColor: 'transparent' },
    },
  };
});

// ---------------------------------------------------------------------------------------------------------------------

export default function Markdown({ ...other }) {
  return (
    <MarkdownStyle>
      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components} {...other} />
    </MarkdownStyle>
  );
}

export function MarkdownCaption({ children }) {
  return (
    <MarkdownStyle>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ ...props }) => <Typography variant="caption" {...props} />,
          h1: ({ ...props }) => <Typography variant="caption" {...props} />,
          h2: ({ ...props }) => <Typography variant="caption" {...props} />,
          h3: ({ ...props }) => <Typography variant="caption" {...props} />,
          li: ({ ...props }) => <Typography component="li" variant="caption" {...props} />,
          span: ({ ...props }) => <Typography component="span" variant="caption" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </MarkdownStyle>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const components = {
  h1: ({ ...props }) => <Typography variant="h1" {...props} />,
  h2: ({ ...props }) => <Typography variant="h2" {...props} />,
  h3: ({ ...props }) => <Typography variant="h3" {...props} />,
  h4: ({ ...props }) => <Typography variant="h4" {...props} />,
  h5: ({ ...props }) => <Typography variant="h5" {...props} />,
  h6: ({ ...props }) => <Typography variant="h6" {...props} />,
  hr: ({ ...props }) => <Divider sx={{ my: 3 }} {...props} />,
  img: ({ ...props }) => <Image alt={props.alt} ratio="16/9" sx={{ borderRadius: 2, my: 5 }} {...props} />,
  a: ({ ...props }) =>
    props.href?.includes('http') ? <Link target="_blank" rel="noopener" {...props} /> : <Link {...props} />,

  p: ({ ...props }) => {
    if (props.style) return <p {...props} />;
    return <Typography variant="body1" {...props} />;
  },

  li: ({ node, className, style, ...props }) => {
    let indent = 0;
    if (className?.includes('ql-indent-1')) indent = 1;
    else if (className?.includes('ql-indent-2')) indent = 2;
    else if (className?.includes('ql-indent-3')) indent = 3;
    else if (className?.includes('ql-indent-4')) indent = 4;
    else if (className?.includes('ql-indent-5')) indent = 5;

    const isBullet = node?.properties?.['data-list'] === 'bullet';

    return (
      <li
        style={{ marginLeft: indent * 24, lineHeight: 2, listStyleType: isBullet ? 'disc' : undefined, ...style }}
        className={className}
        {...props}
      />
    );
  },
};
