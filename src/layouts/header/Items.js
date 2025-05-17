import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Badge from '@mui/material/Badge';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { alpha, styled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Id, AjudaIcon, DenunciaIcon, LinksIcon, DefinicoesIcon, NotificacoesIcon } from '../../assets';
// utils
import { BASEURL } from '../../utils/apisUrl';
// redux
import { useSelector } from '../../redux/store';
// hooks
import useToggle from '../../hooks/useToggle';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import { IconButtonAnimate } from '../../components/animate';
// sections
import AjudaDialog from '../../sections/home/Ajuda';
import { ValidarDocForm, DenunciaForm } from '../../sections/home/HomeForm';

// ----------------------------------------------------------------------

const LogoApp = styled(Avatar)(() => ({ p: 0.5, width: '33px', height: '33px' }));

// ----------------------------------------------------------------------

export function ValidarDocumento() {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <IconButtonHeader title="Validação de documento" open={open} setOpen={onOpen} />
      {open && <ValidarDocForm open onCancel={onClose} />}
    </>
  );
}

export function Ajuda() {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <IconButtonHeader title="Ajuda" open={open} setOpen={onOpen} />
      {open && <AjudaDialog onClose={onClose} />}
    </>
  );
}

export function Denuncia() {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <IconButtonHeader title="Denúncia" open={open} setOpen={onOpen} />
      {open && (
        <Dialog open onClose={onClose} fullWidth maxWidth="md">
          <DenunciaForm onCancel={onClose} />
        </Dialog>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

export function LinksUteis() {
  const [open, setOpen] = useState(false);
  const { links } = useSelector((state) => state.intranet);

  return (
    <>
      <IconButtonHeader title="Links úteis" open={open} setOpen={setOpen} />
      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => setOpen(false)}
        sx={{ width: 360, p: 0, pb: 1, mt: 1.5, ml: 0.75, overflow: 'inherit' }}
      >
        <Typography variant="subtitle1" sx={{ p: 2 }}>
          Links úteis
        </Typography>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ maxHeight: 'calc(100vh - 150px)' }}>
          {links.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
              Sem links disponíveis
            </Typography>
          ) : (
            links?.map(({ link, nome, logo_disco: logo }) => (
              <Link target="_blank" key={link} href={link} rel="noreferrer">
                <MenuItem divider sx={{ py: 1.25, px: 2.5, borderStyle: 'dotted' }}>
                  <ListItemIcon>
                    <LogoApp variant="rounded" alt={nome} src={`${BASEURL}/aplicacao/logo/${logo}`} />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}>
                    {nome}
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

// ----------------------------------------------------------------------

IconButtonHeader.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  total: PropTypes.number,
  title: PropTypes.string,
};

export function IconButtonHeader({ title, open, setOpen, total }) {
  return (
    <Tooltip arrow title={title}>
      <IconButtonAnimate
        color={open ? 'primary' : 'default'}
        onClick={(event) => setOpen(event.currentTarget)}
        sx={{
          padding: 0,
          color: '#fff',
          width: { xs: 28, sm: 40 },
          height: { xs: 28, sm: 40 },
          ...(open && { bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity) }),
        }}
      >
        {title === 'Notificações' ? (
          <Badge badgeContent={total} color="error">
            <NotificacoesIcon sx={{ width: { xs: 20, sm: 28 }, height: { xs: 20, sm: 28 } }} />
          </Badge>
        ) : (
          <Box sx={{ width: { xs: 20, sm: 28 }, height: { xs: 20, sm: 28 } }}>
            {title === 'Ajuda' && <AjudaIcon />}
            {title === 'Links úteis' && <LinksIcon />}
            {title === 'Denúncia' && <DenunciaIcon />}
            {title === 'Validação de documento' && <Id />}
            {title === 'Definições' && <DefinicoesIcon />}
          </Box>
        )}
      </IconButtonAnimate>
    </Tooltip>
  );
}
