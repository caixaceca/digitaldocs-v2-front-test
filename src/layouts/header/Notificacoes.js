/* eslint-disable no-unused-expressions */
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import {
  Box,
  List,
  Badge,
  Avatar,
  Tooltip,
  Divider,
  Typography,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';
// utils
import { sub } from 'date-fns';
import { fToNow } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getNotificacao, lerTodasNotificacoes } from '../../redux/slices/ajuda';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// components
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import TextMaxLine from '../../components/TextMaxLine';
import SvgIconStyle from '../../components/SvgIconStyle';
import { IconButtonAnimate } from '../../components/animate';

// ----------------------------------------------------------------------

export default function Notificacoes() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(null);
  const { mail } = useSelector((state) => state.colaborador);
  const { notificacoes } = useSelector((state) => state.ajuda);
  const total = notificacoes?.length;
  const totalUnRead = notificacoes.filter((item) => !item.vista).length;
  const dataSorted = applySort(notificacoes, getComparator('desc', 'criado_em'));

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleVerTodas = () => {
    dispatch(lerTodasNotificacoes(mail));
    setOpen(null);
  };

  return (
    <>
      <Tooltip arrow title="Notificações">
        <IconButtonAnimate
          color={open ? 'primary' : 'default'}
          onClick={handleOpen}
          sx={{
            width: { xs: 30, sm: 40 },
            height: { xs: 30, sm: 40 },
            color: '#fff',
            ...(open && {
              bgcolor: (theme) => alpha(theme.palette.grey[100], theme.palette.action.focusOpacity),
            }),
          }}
        >
          <Badge badgeContent={totalUnRead} color="error">
            <SvgIconStyle
              src="/assets/icons/header/bell.svg"
              sx={{ width: { xs: 20, sm: 26 }, height: { xs: 20, sm: 26 } }}
            />
          </Badge>
        </IconButtonAnimate>
      </Tooltip>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, pb: 1, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notificações</Typography>
            {total > 0 && (
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
                <SvgIconStyle src="/assets/icons/header/clear_all.svg" />
              </IconButtonAnimate>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {total > 0 ? (
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

NotificationItem.propTypes = {
  onClose: PropTypes.func,
  notificacao: PropTypes.object,
};

function NotificationItem({ notificacao, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mail } = useSelector((state) => state.colaborador);
  const _title = '';
  const handleViewRow = (_notificacao) => {
    !notificacao?.vista && dispatch(getNotificacao(notificacao?.id, mail));
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
      sx={{
        // borderRadius: 1.5,
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(!notificacao.vista && {
          bgcolor: 'action.focus',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral', p: 1.25 }}>
          {((notificacao.objeto === 'norma' ||
            notificacao.objeto === 'legislacao' ||
            notificacao.objeto === 'documento_suporte' ||
            notificacao.objeto === 'parceria' ||
            notificacao.objeto === 'doc_suporte') && (
            <img alt={_title || notificacao.titulo} src="/assets/icons/header/doc-check.svg" />
          )) ||
            ((notificacao.objeto === 'feria' ||
              notificacao.objeto === 'consulta' ||
              notificacao.objeto === 'requisicao' ||
              notificacao.objeto === 'feriado' ||
              notificacao.objeto === 'ausencia' ||
              notificacao.objeto === 'pedido') && (
              <img alt={_title || notificacao.titulo} src="/assets/icons/header/calendar-svgrepo.svg" />
            )) ||
            (notificacao.objeto === 'noticia' && (
              <img alt={_title || notificacao.titulo} src="/assets/icons/header/newspaper-news-svgrepo-com.svg" />
            )) ||
            ((notificacao.objeto === 'inquerito' || notificacao.objeto === 'inquerito_resposta') && (
              <img alt={_title || notificacao.titulo} src="/assets/icons/header/inquerito_repo.svg" />
            )) ||
            (notificacao.objeto === 'sugestao' && (
              <img alt={_title || notificacao.titulo} src="/assets/icons/header/chat-svgrepo-com.svg" />
            )) ||
            (notificacao.objeto === 'visita' && (
              <img alt={_title || notificacao.titulo} src="/assets/icons/header/id-card-svgrepo-com.svg" />
            )) || <img alt={_title || notificacao.titulo} src="/assets/icons/header/notification-svgrepo-com.svg" />}
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
          <Typography
            variant="caption"
            sx={{
              mt: 0.25,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.75,
            }}
          >
            <SvgIconStyle src="/assets/icons/header/clock.svg" sx={{ mr: 0.5, width: 14, height: 14 }} />
            {fToNow(sub(new Date(notificacao.criado_em), { hours: 1 }))}
          </Typography>
        }
      />
    </ListItemButton>
  );
}
