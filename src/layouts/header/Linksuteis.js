import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
// redux
import { useSelector } from '../../redux/store';
// utils
import { BASEURL } from '../../utils/axios';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import { IconButtonAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

const LogoApp = styled(Avatar)(() => ({ p: 0.5, width: '33px', height: '33px' }));

//

export default function Linksuteis() {
  const { links } = useSelector((state) => state.intranet);
  const [open, setOpen] = useState(false);

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
            width: { xs: 28, sm: 40 },
            height: { xs: 28, sm: 40 },
            transform: 'rotate(-45deg)',
            ...(open && { bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity) }),
          }}
        >
          <LinkOutlinedIcon sx={{ width: { xs: 22, sm: 30 }, height: { xs: 22, sm: 30 } }} />
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
          {links.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
              Sem links disponíveis
            </Typography>
          ) : (
            links?.map((link) => (
              <Link href={link.link} rel="noreferrer" target="_blank" key={link.link}>
                <MenuItem onClick={handleClose} sx={{ py: 1, px: 2.5 }}>
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
