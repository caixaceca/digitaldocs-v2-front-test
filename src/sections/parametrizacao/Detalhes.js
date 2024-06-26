import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { fPercent } from '../../utils/formatNumber';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import { Criado } from '../../components/Panel';
import { TextItem } from '../tabela/CartoesForm';
import { Fechar } from '../../components/Actions';

// ----------------------------------------------------------------------

Detalhes.propTypes = { item: PropTypes.string, closeModal: PropTypes.func };

export function Detalhes({ item, closeModal }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { selectedItem, isOpenView, isLoading } = useSelector((state) => state.parametrizacao);
  const perfil = colaboradores?.find((row) => Number(row?.perfil_id) === Number(selectedItem?.perfil_id));

  return (
    <Dialog open={isOpenView} onClose={closeModal} fullWidth maxWidth="sm">
      <DialogTitle sx={{ mb: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          Detalhes
          <Fechar handleClick={closeModal} />
        </Stack>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Stack justifyContent="space-between" alignItems="center" spacing={3}>
            <Skeleton variant="text" sx={{ height: 300, width: 1, mt: 2, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 200, width: 1, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 150, width: 1, transform: 'scale(1)' }} />
          </Stack>
        ) : (
          <>
            <List>
              <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                <Typography variant="subtitle1">Dados</Typography>
              </ListItem>
              {'ativo' in selectedItem && (
                <TextItem
                  title="Estado:"
                  label={
                    <Label variant="ghost" color={selectedItem?.ativo ? 'success' : 'default'}>
                      {selectedItem?.ativo ? 'Ativo' : 'Inativo'}
                    </Label>
                  }
                />
              )}
              {'obrigatorio' in selectedItem && (
                <TextItem
                  title="Obrigatório:"
                  label={
                    <Label variant="ghost" color={selectedItem?.obrigatorio ? 'success' : 'default'}>
                      {selectedItem?.obrigatorio ? 'Sim' : 'Não'}
                    </Label>
                  }
                />
              )}
              {selectedItem?.designacao && (
                <TextItem
                  title={(item === 'regras anexos' && 'Anexo:') || 'Designação:'}
                  text={`${selectedItem.designacao}${
                    selectedItem?.designacao_id ? ` (ID: ${selectedItem?.designacao_id})` : ''
                  }`}
                />
              )}
              {selectedItem?.assunto && (
                <TextItem
                  title="Assunto:"
                  text={`${selectedItem.assunto}${selectedItem?.fluxo_id ? ` (ID: ${selectedItem?.fluxo_id})` : ''}`}
                />
              )}
              {selectedItem?.estado && (
                <TextItem
                  title={item === 'regras transicao' ? 'Origem:' : 'Ambiente:'}
                  text={`${selectedItem.estado}${selectedItem?.estado_id ? ` (ID: ${selectedItem?.estado_id})` : ''}`}
                />
              )}
              {selectedItem?.estado_final && (
                <TextItem
                  title="Destino:"
                  text={`${selectedItem.estado_final}${
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
              {'obriga_prazo_validade' in selectedItem && (
                <TextItem
                  title="Obriga prazo de validade:"
                  label={
                    <Label variant="ghost" color={selectedItem?.obriga_prazo_validade ? 'success' : 'default'}>
                      {selectedItem?.obriga_prazo_validade ? 'Sim' : 'Não'}
                    </Label>
                  }
                />
              )}
              {'reutilizavel' in selectedItem && (
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
            <List>
              <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                <Typography variant="subtitle1">Registo</Typography>
              </ListItem>
              <TextItem
                title="Adicionado:"
                text1={
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {selectedItem?.criador && <Criado tipo="user" value={selectedItem?.criador} shuffle />}
                    {selectedItem?.criado_em && (
                      <Criado tipo="data" value={ptDateTime(selectedItem?.criado_em)} shuffle />
                    )}
                  </Stack>
                }
              />
              {(selectedItem?.modificador || selectedItem?.modificado_em || selectedItem?.modificado_por) && (
                <TextItem
                  title="Modificado:"
                  text1={
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {selectedItem?.modificador && <Criado tipo="user" value={selectedItem?.modificador} shuffle />}
                      {selectedItem?.modificado_por && (
                        <Criado tipo="user" value={selectedItem?.modificado_por} shuffle />
                      )}
                      {selectedItem?.modificado_em && (
                        <Criado tipo="data" value={ptDateTime(selectedItem?.modificado_em)} />
                      )}
                    </Stack>
                  }
                />
              )}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
