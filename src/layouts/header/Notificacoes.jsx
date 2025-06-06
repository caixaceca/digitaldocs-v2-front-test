import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
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
import { IconButtonHeader } from './Items';
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

  return (
    <>
      <IconButtonHeader title="Notificações" open={open} setOpen={setOpen} />

      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => setOpen(null)}
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
              <IconButtonAnimate color="primary" onClick={() => setOpen(null)}>
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
                <NotificationItem key={notificacao.id} notificacao={notificacao} onClose={() => setOpen(null)} />
              ))}
            </List>
          </Scrollbar>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1, fontStyle: 'italic' }}>
              Não tens nenhuma notificação...
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
  const handleViewRow = () => {
    navigate(`${PATH_DIGITALDOCS.root}`);
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
              {notificacao.titulo}
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
