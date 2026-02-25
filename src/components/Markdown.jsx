import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Divider, Typography, Box } from '@mui/material';
// componentes
import Image from './Image';

// ---------------------------------------------------------------------------------------------------------------------

const cleanProps = (props) => {
  const cleanProps = { ...props };
  delete cleanProps.node;
  return cleanProps;
};

// ---------------------------------------------------------------------------------------------------------------------

const MarkdownStyle = styled('div')(({ theme }) => {
  const isLight = theme.palette.mode === 'light';
  return {
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    '& ul, & ol': {
      ...theme.typography.body1,
      paddingLeft: theme.spacing(3),
      '& li': { lineHeight: 1.5, '& > p': { margin: 0, display: 'inline' } },
    },
    '& ul': { listStyleType: 'disc' },
    '& ol': { listStyleType: 'decimal' },
    '& .ql-ui': { display: 'none' },
    '& blockquote': {
      margin: theme.spacing(4, 0),
      padding: theme.spacing(2, 2, 2, 5),
      position: 'relative',
      fontStyle: 'italic',
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.background.neutral,
      borderRadius: theme.shape.borderRadius,
      borderLeft: `4px solid ${theme.palette.divider}`,
      '&:before': {
        left: 10,
        top: -10,
        opacity: 0.5,
        fontSize: '3em',
        content: '"\\201C"',
        position: 'absolute',
        color: theme.palette.text.disabled,
      },
    },
    '& code': {
      borderRadius: 4,
      fontSize: '0.85em',
      padding: '2px 4px',
      color: theme.palette.warning[isLight ? 'darker' : 'lighter'],
      backgroundColor: theme.palette.warning[isLight ? 'lighter' : 'darker'],
    },
    '& pre': {
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.grey[isLight ? 900 : 800],
      '& code': { padding: 0, color: theme.palette.common.white, backgroundColor: 'transparent' },
    },
  };
});

// ---------------------------------------------------------------------------------------------------------------------

const createComponents = (variant, caption) => ({
  h1: (props) => <Typography variant={caption ? 'caption' : 'h1'} gutterBottom {...cleanProps(props)} />,
  h2: (props) => <Typography variant={caption ? 'caption' : 'h2'} gutterBottom {...cleanProps(props)} />,
  h3: (props) => <Typography variant={caption ? 'caption' : 'h3'} gutterBottom {...cleanProps(props)} />,
  h4: (props) => <Typography variant={caption ? 'caption' : 'h4'} gutterBottom {...cleanProps(props)} />,
  h5: (props) => <Typography variant={caption ? 'caption' : 'h5'} gutterBottom {...cleanProps(props)} />,
  h6: (props) => <Typography variant={caption ? 'caption' : 'h6'} gutterBottom {...cleanProps(props)} />,
  hr: (props) => <Divider sx={{ my: 3 }} {...cleanProps(props)} />,

  img: (props) => <Image alt={props.alt} ratio="16/9" sx={{ borderRadius: 2, my: 3 }} {...cleanProps(props)} />,
  a: (props) => (
    <Link target={props.href?.includes('http') ? '_blank' : '_self'} rel="noopener" {...cleanProps(props)} />
  ),

  p: (props) => {
    const { children } = props;
    const isEmpty = React.Children.count(children) === 0 || (typeof children === 'string' && children.trim() === '');

    if (isEmpty && !caption) return <Box sx={{ height: 20 }} />;

    return (
      <Typography variant={caption ? 'caption' : variant} component="p" {...cleanProps(props)}>
        {children}
      </Typography>
    );
  },

  li: (p) => {
    const { node, className, children } = p;
    const indentMatch = className?.match(/ql-indent-(\d+)/);
    const indentLevel = indentMatch ? parseInt(indentMatch[1], 10) : 0;
    const isBullet = node?.properties?.['data-list'] === 'bullet';

    return (
      <Box
        component="li"
        className={className}
        sx={{
          ml: indentLevel * 3,
          listStyleType: isBullet ? 'disc' : undefined,
          ...(theme) => theme.typography[caption ? 'caption' : variant],
          '& .MuiTypography-root': { display: 'inline', fontSize: 'inherit' },
        }}
        {...cleanProps(p)}
      >
        {children}
      </Box>
    );
  },
});

// ---------------------------------------------------------------------------------------------------------------------

export default function Markdown({ caption = false, variant = 'body1', children, ...other }) {
  const components = useMemo(() => createComponents(variant, caption), [variant, caption]);

  const content = useMemo(() => {
    if (typeof children !== 'string') return children;

    return children
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ');
  }, [children]);

  return (
    <MarkdownStyle>
      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components} {...other}>
        {content}
      </ReactMarkdown>
    </MarkdownStyle>
  );
}
