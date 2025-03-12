import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
// utils
import { getFileThumb } from '../../../../utils/formatFile';
import { findColaborador } from '../../../../utils/formatObject';
import { ptDateTime, ptDate } from '../../../../utils/formatTime';
// redux
import { getSuccess } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import { Criado } from '../../../../components/Panel';
import { DefaultAction } from '../../../../components/Actions';

// ----------------------------------------------------------------------

AnexosExistente.propTypes = { onOpen: PropTypes.func, anexos: PropTypes.array };

export default function AnexosExistente({ anexos, onOpen = null }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  return (
    <>
      <Typography sx={{ pb: 1, pl: 0.5, typography: 'overline' }}>Anexos existente</Typography>
      <Stack spacing={1}>
        {anexos.map((row) => (
          <ListItem key={row?.id} sx={{ py: 0.5, pl: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
            <ListItemIcon>{getFileThumb(false, null, row?.path || row.name)}</ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ variant: 'subtitle2', p: 0, lineHeight: 1.25 }}
              primary={
                row?.tipo === 'OUTROS' ? (
                  row?.name || row?.path
                ) : (
                  <>
                    {`${row.tipo}${row?.entidade ? ` - ${row.entidade}` : ''}`}
                    <Typography variant="spam" sx={{ typography: 'body2', color: 'text.secondary', lineHeight: 1.25 }}>
                      &nbsp;({row?.name || row?.path})
                    </Typography>
                  </>
                )
              }
              secondary={
                (row?.criado_em || row?.criador || row?.data_emissao || row?.data_validade) && (
                  <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 0.5 }}>
                    {row?.criador && (
                      <Criado caption tipo="user" value={findColaborador(row?.criador, colaboradores)} baralhar />
                    )}
                    {row?.criado_em && <Criado caption tipo="data" value={ptDateTime(row?.criado_em)} />}
                    {row?.data_emissao && <Criado caption iconText="Emissão:" value={ptDate(row?.data_emissao)} />}
                    {row?.data_validade && <Criado caption iconText="Validade:" value={ptDate(row?.data_validade)} />}
                  </Stack>
                )
              }
            />
            <ListItemSecondaryAction>
              <DefaultAction
                small
                label="ELIMINAR"
                handleClick={() => {
                  if (onOpen) onOpen(row.id);
                  else dispatch(getSuccess({ item: 'selectedAnexoId', dados: row.anexo }));
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </Stack>
    </>
  );
}
