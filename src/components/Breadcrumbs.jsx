import { Link as RouterLink } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MUIBreadcrumbs from '@mui/material/Breadcrumbs';

// ---------------------------------------------------------------------------------------------------------------------

export default function Breadcrumbs({ links, activeLast = false, ...other }) {
  const currentLink = links[links.length - 1].name;

  const listDefault = links.map((link) => <LinkItem key={link.name} link={link} />);

  const listActiveLast = links.map((link) => (
    <div key={link.name}>
      {link.name !== currentLink ? (
        <LinkItem link={link} />
      ) : (
        <Typography
          variant="caption"
          sx={{
            maxWidth: 260,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: 'text.disabled',
            textOverflow: 'ellipsis',
          }}
        >
          {currentLink}
        </Typography>
      )}
    </div>
  ));

  return (
    <Stack direction="row" justifyContent={{ xs: 'center', sm: 'left' }}>
      <MUIBreadcrumbs
        separator={<Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />}
        {...other}
      >
        {activeLast ? listDefault : listActiveLast}
      </MUIBreadcrumbs>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function LinkItem({ link }) {
  const { href, name, icon } = link;
  return (
    <Link
      key={name}
      variant="caption"
      component={RouterLink}
      to={href || '#'}
      sx={{
        lineHeight: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'text.primary',
        '& > div': { display: 'inherit' },
      }}
    >
      {icon && <Box sx={{ mr: 1, '& svg': { width: 20, height: 20 } }}>{icon}</Box>}
      {name}
    </Link>
  );
}
