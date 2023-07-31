import { useState } from 'react';
// @mui
import { alpha, styled } from '@mui/material/styles';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Box, Avatar, Tooltip, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Link } from '@mui/material';
// redux
import { useSelector } from '../../redux/store';
// utils
import { BASEURL } from '../../utils/axios';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import { IconButtonAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

const LogoApp = styled(Avatar)(() => ({ p: 0.5, width: '33px', height: '33px' }));

//

export default function Linksuteis() {
  const { links } = useSelector((state) => state.intranet);
  const noLink = links.length === 0;
  const [open, setOpen] = useState(false);

  const linksOrder = applySort(links, getComparator('asc', 'nome'));

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <Tooltip arrow title="Links úteis">
        <IconButtonAnimate
          color={open ? 'primary' : 'default'}
          onClick={handleOpen}
          sx={{
            p: 0,
            color: '#fff',
            width: { xs: 30, sm: 40 },
            height: { xs: 30, sm: 40 },
            transform: 'rotate(-45deg)',
            ...(open && { bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity) }),
          }}
        >
          <LinkOutlinedIcon sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />
        </IconButtonAnimate>
      </Tooltip>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, pb: 0.5, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Links úteis</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ maxHeight: { xs: 340, sm: 420 } }}>
          {linksOrder.map((link) => (
            <Link href={link.link} rel="noreferrer" target="_blank" key={link.link}>
              <MenuItem onClick={handleClose} sx={{ py: 1, px: 2.5 }}>
                <ListItemIcon>
                  <LogoApp variant="rounded" alt={link.nome} src={`${BASEURL}/aplicacao/logo/${link.logo_disco}`} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: 'body2' }}>{link.nome}</ListItemText>
              </MenuItem>
            </Link>
          ))}
          {noLink && (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
              Sem links disponíveis
            </Typography>
          )}
        </Scrollbar>
      </MenuPopover>
    </>
  );
}
