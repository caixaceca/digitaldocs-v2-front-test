import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MarkChatUnreadOutlinedIcon from '@mui/icons-material/MarkChatUnreadOutlined';
// utils
import { sub } from 'date-fns';
import { fToNow } from '../../utils/formatTime';
// redux
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import TextMaxLine from '../../components/TextMaxLine';
import { IconButtonAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

export default function Notificacoes() {
  const [open, setOpen] = useState(null);
  const { notificacoes } = useSelector((state) => state.intranet);
  const totalUnRead = notificacoes.filter((item) => !item.vista).length;
  const dataSorted = applySort(notificacoes, getComparator('desc', 'criado_em'));

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleVerTodas = () => {
    // dispatch(lerTodasNotificacoes(mail));
    setOpen(null);
  };

  return (
    <>
      <Tooltip arrow title="Notificações">
        <IconButtonAnimate
          color={open ? 'primary' : 'default'}
          onClick={handleOpen}
          sx={{
            p: 0,
            color: '#fff',
            width: { xs: 28, sm: 40 },
            height: { xs: 28, sm: 40 },
            ...(open && {
              bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity),
            }),
          }}
        >
          <Badge badgeContent={totalUnRead} color="error">
            <NotificationsOutlinedIcon sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 } }} />
          </Badge>
        </IconButtonAnimate>
      </Tooltip>

      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={handleClose}
        sx={{ width: 360, p: 0, pb: 1, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notificações</Typography>
            {notificacoes?.length > 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {totalUnRead === 0
                  ? 'Todas as notificaçõs já foram vistas'
                  : `Você tem ${totalUnRead} notificações não vista`}
              </Typography>
            )}
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Marcar todas como vistas" arrow>
              <IconButtonAnimate color="primary" onClick={handleVerTodas}>
                <DoneAllOutlinedIcon />
              </IconButtonAnimate>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {notificacoes?.length > 0 ? (
          <Scrollbar sx={{ maxHeight: { xs: 340, sm: 420 } }}>
            <List disablePadding>
              {dataSorted.slice().map((notificacao) => (
                <NotificationItem key={notificacao.id} notificacao={notificacao} onClose={handleClose} />
              ))}
            </List>
          </Scrollbar>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1, fontStyle: 'italic' }}>
              Não tens nenhuma notificação
            </Typography>
          </Box>
        )}
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = { onClose: PropTypes.func, notificacao: PropTypes.object };

function NotificationItem({ notificacao, onClose }) {
  const navigate = useNavigate();
  const _title = '';
  const handleViewRow = (_notificacao) => {
    if (!notificacao?.vista) {
      // dispatch(getNotificacao(notificacao?.id, mail));
    }
    switch (_notificacao.objeto) {
      case 'norma':
        navigate(`${PATH_DIGITALDOCS.general}`);
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <ListItemButton
      onClick={() => handleViewRow(notificacao)}
      sx={{ py: 1.5, px: 2.5, mt: '1px', ...(!notificacao.vista && { bgcolor: 'action.focus' }) }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral', p: 1.25 }}>
          <MarkChatUnreadOutlinedIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <TextMaxLine line={2}>
            <Typography variant="subtitle2">
              {_title || notificacao.titulo}
              <Typography component="span" variant="body2">
                &nbsp; {notificacao.descricao}
              </Typography>
            </Typography>
          </TextMaxLine>
        }
        secondary={
          <Typography variant="caption" sx={{ mt: 0.25, display: 'flex', alignItems: 'center', opacity: 0.75 }}>
            <AccessTimeOutlinedIcon sx={{ mr: 0.5, width: 14, height: 14 }} />
            {fToNow(sub(new Date(notificacao.criado_em), { hours: 1 }))}
          </Typography>
        }
      />
    </ListItemButton>
  );
}
