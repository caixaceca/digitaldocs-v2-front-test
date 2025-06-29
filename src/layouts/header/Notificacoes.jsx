import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// redux
import { useSelector } from '../../redux/store';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// components
import { IconButtonHeader } from '.';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';

// ---------------------------------------------------------------------------------------------------------------------

export default function Notificacoes() {
  const [open, setOpen] = useState(null);
  const { notificacoes } = useSelector((state) => state.intranet);
  const totalUnRead = notificacoes.filter(({ vista }) => !vista).length;

  return (
    <>
      <IconButtonHeader title="Notificações" open={open} setOpen={setOpen} total={totalUnRead} />

      <MenuPopover
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        sx={{ width: 360, p: 0, pb: 1, mt: 1.5, ml: 0.75, overflow: 'inherit' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notificações</Typography>
            {notificacoes.length > 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {totalUnRead === 0
                  ? 'Todas as notificações já foram vistas'
                  : `Você tem ${totalUnRead} notificação${totalUnRead > 1 ? 's' : ''} não vista${totalUnRead > 1 ? 's' : ''}`}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {notificacoes.length > 0 ? (
          <Scrollbar sx={{ maxHeight: { xs: 340, sm: 420 } }}>
            <List disablePadding>
              {applySort(notificacoes, getComparator('desc', 'criado_em')).map((row, index) => (
                <Box key={`notificacao_${index}`}>
                  {/* <NotificationItem notificacao={row} onClose={() => setOpen(false)} /> */}
                  <Divider sx={{ borderColor: 'background.paper' }} />
                </Box>
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
