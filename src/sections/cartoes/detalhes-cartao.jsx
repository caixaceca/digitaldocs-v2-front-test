// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { baralharString } from '../../utils/formatText';
import { ptDate, ptDateTime } from '../../utils/formatTime';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import { Criado } from '../../components/Panel';
import { SearchNotFoundSmall } from '../../components/table';
import { DialogTitleAlt } from '../../components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export function Detalhes({ closeModal }) {
  const { uos } = useSelector((state) => state.intranet);
  const { selectedItem, isLoading } = useSelector((state) => state.digitaldocs);
  const bEntrega = uos?.find(({ balcao }) => Number(balcao) === Number(selectedItem?.balcao_entrega));
  const bEmissao = uos?.find(({ balcao }) => Number(balcao) === Number(selectedItem?.balcao_emissao));
  const bDomicilio = uos?.find(({ balcao }) => Number(balcao) === Number(selectedItem?.balcao_cliente));
  const bEntregaOriginal = uos?.find(({ balcao }) => Number(balcao) === Number(selectedItem?.balcao_entrega_original));

  return (
    <Dialog open onClose={closeModal} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Detalhes do cartão" onClose={closeModal} />
      <DialogContent>
        {isLoading ? (
          <Stack justifyContent="space-between" alignItems="center" spacing={3} sx={{ mt: 1 }}>
            <Skeleton variant="text" sx={{ height: 200, width: 1, mt: 2, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 125, width: 1, transform: 'scale(1)' }} />
            <Skeleton variant="text" sx={{ height: 125, width: 1, transform: 'scale(1)' }} />
          </Stack>
        ) : (
          <>
            {selectedItem ? (
              <>
                <List>
                  <TextItem title="Tipo de cartão:" text={selectedItem.tipo} />
                  <TextItem title="Nº do cartão:" text={baralharString(selectedItem?.numero?.substring(9, 15))} />
                  <TextItem title="Data de emissão:" text={ptDate(selectedItem.data_emissao)} />
                  {bDomicilio && (
                    <TextItem title="Balcão de domicílio:" text={`${bDomicilio?.label} (${bDomicilio?.balcao})`} />
                  )}
                  {bEmissao && (
                    <TextItem title="Balcão de emissão:" text={`${bEmissao?.label} (${bEmissao?.balcao})`} />
                  )}
                  {bEntrega && (
                    <TextItem
                      title="Balcão de entrega:"
                      text={`${bEntrega?.label} (${bEntrega?.balcao})`}
                      text1={
                        bEntregaOriginal && selectedItem?.balcao_entrega !== selectedItem?.balcao_entrega_original ? (
                          <Typography>
                            ORIGINAL: {`${bEntregaOriginal?.label} (${bEntregaOriginal?.balcao})`}
                          </Typography>
                        ) : null
                      }
                    />
                  )}
                  <TextItem title="Nº cliente:" text={baralharString(selectedItem.cliente)} />
                  <TextItem title="Nome:" text={baralharString(selectedItem.nome)} />
                </List>
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Confirmação de receção</Typography>
                  </ListItem>
                  {selectedItem?.emissao_validado && selectedItem?.data_rececao_sisp && (
                    <TextItem title="Data recebido da SISP:" text={ptDate(selectedItem?.data_rececao_sisp)} />
                  )}
                  <TextItem
                    title="Confirmação DOP-CE:&nbsp;"
                    label={
                      <Label variant="ghost" color={selectedItem?.emissao_validado ? 'success' : 'error'}>
                        {selectedItem?.emissao_validado ? 'Sim' : 'Não'}
                      </Label>
                    }
                    text1={
                      selectedItem?.emissao_validado ? (
                        <Stack sx={{ mt: 1 }}>
                          <Criado tipo="user" value={selectedItem?.emissao_validado_por} baralhar />
                          <Criado tipo="data" value={ptDateTime(selectedItem?.emissao_validado_em)} />
                          <Criado tipo="note" value={selectedItem?.nota_emissao} />
                        </Stack>
                      ) : null
                    }
                  />
                  <TextItem
                    title="Confirmação Agência:"
                    label={
                      <Label variant="ghost" color={selectedItem?.rececao_validado ? 'success' : 'error'}>
                        {selectedItem?.rececao_validado ? 'Sim' : 'Não'}
                      </Label>
                    }
                    text1={
                      selectedItem?.rececao_validado ? (
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Criado tipo="user" value={selectedItem?.rececao_validado_por} baralhar />
                          <Criado tipo="data" value={ptDateTime(selectedItem?.rececao_validado_em)} />
                          <Criado tipo="note" value={selectedItem?.nota_rececao} />
                        </Stack>
                      ) : null
                    }
                  />
                </List>
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Registo</Typography>
                  </ListItem>
                  {selectedItem?.criado_em && <TextItem title="Criado em:" text={ptDateTime(selectedItem.criado_em)} />}
                  {selectedItem?.modificado_em && (
                    <TextItem title="Modificado em:" text={ptDateTime(selectedItem.modificado_em)} />
                  )}
                  {selectedItem?.modificado_por && (
                    <TextItem title="Modificado por:" text={selectedItem.modificado_por} />
                  )}
                </List>
              </>
            ) : (
              <SearchNotFoundSmall message="Cartão não encontrado..." />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TextItem({ title, text = '', text1 = null, label = null }) {
  return text || label || text1 ? (
    <Stack spacing={1} direction="row" alignItems="center" sx={{ py: 1, pb: 0 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Stack>
        {text && <Typography>{text}</Typography>}
        {label && <Typography>{label}</Typography>}
        {text1}
      </Stack>
    </Stack>
  ) : null;
}
