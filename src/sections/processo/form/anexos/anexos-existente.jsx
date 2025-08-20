// @mui
import List from '@mui/material/List';
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

// ---------------------------------------------------------------------------------------------------------------------

export default function AnexosExistente({ anexos, onOpen = null, noTitle = false }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);

  return (
    <>
      {noTitle ? '' : <Typography sx={{ py: 1, pl: 0.5, typography: 'overline' }}>Anexos existente</Typography>}
      <Stack spacing={1} sx={{ pt: noTitle ? 1 : 0 }}>
        {anexos.map(
          ({
            id = '',
            path = '',
            name = '',
            tipo = '',
            anexo = null,
            criador = '',
            entidade = '',
            criado_em: criado = '',
            data_emissao: emissao = '',
            data_validade: validade = '',
          }) => (
            <List key={id} sx={{ p: 0 }}>
              <ListItem sx={{ py: 0.5, pl: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
                <ListItemIcon>{getFileThumb(false, null, path || name)}</ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ variant: 'subtitle2', p: 0, lineHeight: 1.25 }}
                  primary={
                    !tipo || tipo === 'OUTROS' ? (
                      name || path
                    ) : (
                      <>
                        {`${tipo}${entidade ? ` - ${entidade}` : ''}`}
                        <Typography component="span" variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.25 }}>
                          &nbsp;({name || path})
                        </Typography>
                      </>
                    )
                  }
                  secondary={
                    (criado || criador || emissao || validade) && (
                      <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 0.5 }}>
                        <Criado caption tipo="user" value={findColaborador(criador, colaboradores)} baralhar />
                        <Criado caption tipo="data" value={ptDateTime(criado)} />
                        <Criado caption iconText="Emissão:" value={ptDate(emissao)} />
                        <Criado caption iconText="Validade:" value={ptDate(validade)} />
                      </Stack>
                    )
                  }
                />
                <ListItemSecondaryAction>
                  <DefaultAction
                    small
                    label="ELIMINAR"
                    onClick={() => {
                      if (onOpen) onOpen(id);
                      else dispatch(getSuccess({ item: '', dados: anexo }));
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          )
        )}
      </Stack>
    </>
  );
}
