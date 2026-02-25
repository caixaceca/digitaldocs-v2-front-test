// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
// utils
import { ptDateTime } from '@/utils/formatTime';
import { getIntranetFile, getFileThumb } from '@/utils/formatFile';
//
import { Criado } from '../Panel';
import { DefaultAction } from '../Actions';
import { IconClick } from '@/assets/icons';

// ---------------------------------------------------------------------------------------------------------------------

export default function ButtonAnexo({ item, file, hideExtra = false, ...others }) {
  const extra = file?.criador || file?.criado_por || file?.criado_em;
  const { variant = 'soft', color = 'inherit', size = 'medium', handleRemove = null } = others || {};

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        fullWidth
        size={size}
        color={color}
        rel="noopener"
        target="_blank"
        variant={variant}
        href={getIntranetFile(item, file?.filename)}
        sx={{ boxShadow: 'none', p: 0, opacity: others?.eliminado ? 0.75 : 1 }}
      >
        <ListItem sx={{ py: extra ? 0.5 : 0.75 }}>
          <ListItemAvatar>{getFileThumb(false, null, file?.filename?.replace('.gz', ''))}</ListItemAvatar>
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center">
                {file?.nome} {file?.tipo}
                {(hideExtra || !extra) && (
                  <Box>
                    <IconClick sx={{ pl: 1, height: 25, width: 25, scale: '1.15', opacity: 0.64 }} />
                  </Box>
                )}
              </Stack>
            }
            primaryTypographyProps={{ variant: others?.eliminado ? 'body2' : 'subtitle2' }}
            secondary={
              !hideExtra &&
              extra && (
                <Stack spacing={{ sm: 1 }} direction={{ xs: 'column', sm: 'row' }} sx={{ pt: 0.25 }}>
                  <Criado caption tipo="user" value={file?.criador || file?.criado_por} />
                  <Criado caption tipo="data" value={ptDateTime(file?.criado_em)} />
                </Stack>
              )
            }
          />
        </ListItem>
      </Button>
      {handleRemove && <DefaultAction label="ELIMINAR" small onClick={handleRemove} />}
    </Stack>
  );
}
