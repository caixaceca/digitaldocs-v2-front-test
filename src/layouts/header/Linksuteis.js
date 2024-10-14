import { useState } from 'react';
// @mui
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import LinkIcon from '@mui/icons-material/Link';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// redux
import { useSelector } from '../../redux/store';
// utils
import { BASEURL } from '../../utils/axios';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import { IconButtonAnimate } from '../../components/animate';

const LogoApp = styled(Avatar)(() => ({ p: 0.5, width: '33px', height: '33px' }));
const IconButtonStd = { padding: 0, color: '#fff', width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 } };

// ----------------------------------------------------------------------

export default function Linksuteis() {
  const { links } = useSelector((state) => state.intranet);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip arrow title="Links úteis">
        <IconButtonAnimate
          color={open ? 'primary' : 'default'}
          onClick={(event) => setOpen(event.currentTarget)}
          sx={{
            ...IconButtonStd,
            transform: 'rotate(-45deg)',
            ...(open && { bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity) }),
          }}
        >
          <LinkIcon sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />
        </IconButtonAnimate>
      </Tooltip>

      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => setOpen(false)}
        sx={{ width: 360, p: 0, overflow: 'inherit' }}
      >
        <Typography variant="subtitle1" sx={{ p: 2 }}>
          Links úteis
        </Typography>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ maxHeight: { xs: 340, sm: 420 } }}>
          {links.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
              Sem links disponíveis
            </Typography>
          ) : (
            links?.map((link) => (
              <Link
                target="_blank"
                key={link.link}
                href={link.link}
                rel="noreferrer"
                sx={{ textDecoration: 'none !important' }}
              >
                <MenuItem divider sx={{ py: 1.25, px: 2.5, borderStyle: 'dotted' }}>
                  <ListItemIcon>
                    <LogoApp variant="rounded" alt={link.nome} src={`${BASEURL}/aplicacao/logo/${link.logo_disco}`} />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}>
                    {link.nome}
                  </ListItemText>
                </MenuItem>
              </Link>
            ))
          )}
        </Scrollbar>
      </MenuPopover>
    </>
  );
}
