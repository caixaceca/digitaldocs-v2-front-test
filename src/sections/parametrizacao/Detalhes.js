import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { fPercent } from '../../utils/formatNumber';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import { Criado } from '../../components/Panel';
import { TextItem } from '../tabela/CartoesForm';
import { DTFechar } from '../../components/Actions';
import { SearchNotFoundSmall } from '../../components/table';

// ----------------------------------------------------------------------

Detalhes.propTypes = { item: PropTypes.string, closeModal: PropTypes.func };

export function Detalhes({ item, closeModal }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { selectedItem, isLoading } = useSelector((state) => state.parametrizacao);
  const perfil = colaboradores?.find((row) => Number(row?.perfil_id) === Number(selectedItem?.perfil_id));

  return (
    <Dialog open onClose={closeModal} fullWidth maxWidth="sm">
      <DTFechar title="Detalhes" handleClick={() => closeModal()} />
      <DialogContent sx={{ mt: 0.5 }}>
        {isLoading ? (
          <Stack justifyContent="space-between" alignItems="center" spacing={3} sx={{ pt: 2 }}>
            <Skeleton variant="text" sx={{ height: 180, width: 1, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 140, width: 1, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 100, width: 1, transform: 'scale(1)' }} />
          </Stack>
        ) : (
          <>
            {selectedItem ? (
              <>
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Dados</Typography>
                  </ListItem>
                  {!!selectedItem && 'ativo' in selectedItem && (
                    <TextItem
                      title="Estado:"
                      label={
                        <Label variant="ghost" color={selectedItem?.ativo ? 'success' : 'default'}>
                          {selectedItem?.ativo ? 'Ativo' : 'Inativo'}
                        </Label>
                      }
                    />
                  )}
                  {!!selectedItem && 'imputavel' in selectedItem && (
                    <TextItem
                      title="Imputável:"
                      label={
                        <Label variant="ghost" color={selectedItem?.imputavel ? 'success' : 'default'}>
                          {selectedItem?.imputavel ? 'Sim' : 'Não'}
                        </Label>
                      }
                    />
                  )}
                  {!!selectedItem && 'obrigatorio' in selectedItem && (
                    <TextItem
                      title="Obrigatório:"
                      label={
                        <Label variant="ghost" color={selectedItem?.obrigatorio ? 'success' : 'default'}>
                          {selectedItem?.obrigatorio ? 'Sim' : 'Não'}
                        </Label>
                      }
                    />
                  )}
                  <TextItem title="Designação" text={selectedItem?.motivo} />
                  {selectedItem?.designacao && (
                    <TextItem
                      title={(item === 'regras anexos' && 'Anexo:') || 'Designação:'}
                      text={`${selectedItem?.designacao}${
                        selectedItem?.designacao_id ? ` (ID: ${selectedItem?.designacao_id})` : ''
                      }`}
                    />
                  )}
                  {selectedItem?.assunto && (
                    <TextItem
                      title="Assunto:"
                      text={`${selectedItem?.assunto}${selectedItem?.fluxo_id ? ` (ID: ${selectedItem?.fluxo_id})` : ''}`}
                    />
                  )}
                  {selectedItem?.estado && (
                    <TextItem
                      title={item === 'regras transicao' ? 'Origem:' : 'Ambiente:'}
                      text={`${selectedItem?.estado}${selectedItem?.estado_id ? ` (ID: ${selectedItem?.estado_id})` : ''}`}
                    />
                  )}
                  <TextItem title="Observação:" text={selectedItem?.observacao || selectedItem?.obs} />
                  {selectedItem?.estado_final && (
                    <TextItem
                      title="Destino:"
                      text={`${selectedItem?.estado_final}${
                        selectedItem?.estado_final_id ? ` (ID: ${selectedItem?.estado_final_id})` : ''
                      }`}
                    />
                  )}
                  {perfil && (
                    <TextItem
                      title="Colaborador:"
                      text={`${perfil?.perfil?.displayName} (ID_Perfil: ${perfil?.perfil_id})`}
                    />
                  )}
                  {selectedItem?.percentagem && (
                    <TextItem title="Percentagem:" text={fPercent(selectedItem?.percentagem)} />
                  )}
                  {!!selectedItem && 'obriga_prazo_validade' in selectedItem && (
                    <TextItem
                      title="Obriga prazo de validade:"
                      label={
                        <Label variant="ghost" color={selectedItem?.obriga_prazo_validade ? 'success' : 'default'}>
                          {selectedItem?.obriga_prazo_validade ? 'Sim' : 'Não'}
                        </Label>
                      }
                    />
                  )}
                  {!!selectedItem && 'reutilizavel' in selectedItem && (
                    <TextItem
                      title="Reutilizável:"
                      label={
                        <Label variant="ghost" color={selectedItem?.reutilizavel ? 'success' : 'default'}>
                          {selectedItem?.reutilizavel ? 'Sim' : 'Não'}
                        </Label>
                      }
                    />
                  )}
                </List>
                {item === 'motivos transicao' && (
                  <List>
                    <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                      <Typography variant="subtitle1">Fluxos</Typography>
                    </ListItem>
                    <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ py: 1 }} spacing={1}>
                      {selectedItem?.fluxos?.length > 0 ? (
                        applySort(selectedItem?.fluxos, getComparator('asc', 'fluxo'))?.map((row) => (
                          <Label key={row?.id}>{row?.fluxo}</Label>
                        ))
                      ) : (
                        <Label>Todos</Label>
                      )}
                    </Stack>
                  </List>
                )}
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Registo</Typography>
                  </ListItem>
                  <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 1 }} spacing={{ xs: 0.5, sm: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Adicionado:
                      </Typography>
                      <Criado tipo="user" value={selectedItem?.criador} baralhar caption />
                      {!!selectedItem?.criado_em && (
                        <Criado tipo="data" value={ptDateTime(selectedItem?.criado_em)} baralhar caption />
                      )}
                    </Stack>
                    {(!!selectedItem?.modificado_em ||
                      !!selectedItem?.modificador ||
                      !!selectedItem?.modificado_por) && (
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Modificado:
                        </Typography>
                        <Criado
                          caption
                          baralhar
                          tipo="user"
                          value={selectedItem?.modificador || selectedItem?.modificado_por}
                        />
                        {!!selectedItem?.modificado_em && (
                          <Criado tipo="data" value={ptDateTime(selectedItem?.modificado_em)} caption />
                        )}
                      </Stack>
                    )}
                  </Stack>
                </List>
              </>
            ) : (
              <SearchNotFoundSmall message="Item não disponível..." />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
