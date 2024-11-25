import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fPercent } from '../../utils/formatNumber';
import { ptDateTime, ptDate } from '../../utils/formatTime';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import Markdown from '../../components/Markdown';
import { Criado, Checked } from '../../components/Panel';
import { SearchNotFoundSmall } from '../../components/table';
import { UpdateItem, DefaultAction, DTFechar } from '../../components/Actions';
//
import { DestinatarioForm } from './ParametrizacaoForm';

// ----------------------------------------------------------------------

Detalhes.propTypes = { item: PropTypes.string, closeModal: PropTypes.func };

export function Detalhes({ item, closeModal }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { selectedItem } = useSelector((state) => state.parametrizacao);
  const perfil = selectedItem?.perfil_id
    ? colaboradores?.find((row) => Number(row?.perfil_id) === Number(selectedItem?.perfil_id))
    : null;

  return (
    <Dialog open onClose={closeModal} fullWidth maxWidth="sm">
      <DTFechar title="Detalhes" handleClick={() => closeModal()} />
      <DialogContent>
        <DetalhesContent dados={selectedItem} item={item} perfil={perfil} />
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

DetalhesContent.propTypes = {
  uo: PropTypes.object,
  item: PropTypes.string,
  dados: PropTypes.object,
  perfil: PropTypes.object,
};

export function DetalhesContent({ dados = null, item = '', perfil = null, uo = null }) {
  const [destinatario, setDestinatario] = useState(null);
  const { isLoading, destinatarios } = useSelector((state) => state.parametrizacao);

  return (
    <>
      {!dados && isLoading ? (
        <Stack justifyContent="space-between" alignItems="center" spacing={3} sx={{ pt: 2 }}>
          <Skeleton variant="text" sx={{ height: 180, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 140, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 100, width: 1, transform: 'scale(1)' }} />
        </Stack>
      ) : (
        <>
          {dados ? (
            <>
              <List>
                <ListItem disableGutters divider sx={{ pb: 0 }}>
                  <Typography variant="subtitle1">{item === 'Fluxo' ? 'Dados' : ''}</Typography>
                </ListItem>
                <Table size="small">
                  <TableBody>
                    <TableRowItem title="ID:" text={dados?.id} />
                    <TableRowItem title="Código:" text={dados?.codigo} />
                    <TableRowItem
                      title="Designação:"
                      text={dados?.linha || dados?.motivo || dados?.designacao || dados?.descritivo}
                    />
                    <TableRowItem title="Modo:" text={dados?.modo} />
                    <TableRowItem title="Modelo:" text={dados?.modelo} />
                    <TableRowItem title={item === 'linhas' ? 'Segmento:' : 'Descrição:'} text={dados?.descricao} />
                    {dados?.assunto && (
                      <TableRowItem
                        title="Assunto"
                        text={`${dados?.assunto}${dados?.fluxo_id ? ` (ID: ${dados?.fluxo_id})` : ''}`}
                      />
                    )}
                    {dados?.estado && (
                      <TableRowItem
                        title={item === 'regrasTransicao' ? 'Origem:' : 'Ambiente:'}
                        text={`${dados?.estado}${dados?.estado_id ? ` (ID: ${dados?.estado_id})` : ''}`}
                      />
                    )}
                    <TableRowItem title="Documento:" text={dados?.tipo_documento} />
                    {(dados?.estado_inicial || dados?.estado_origem) && (
                      <TableRowItem
                        title="Origem:"
                        text={`${dados?.estado_inicial || dados?.estado_origem}${
                          dados?.estado_inicial_id ? ` (ID: ${dados?.estado_inicial_id})` : ''
                        }`}
                      />
                    )}
                    {(dados?.estado_final || dados?.estado_destino) && (
                      <TableRowItem
                        title="Destino:"
                        text={`${dados?.estado_final || dados?.estado_destino}${dados?.estado_final_id ? ` (ID: ${dados?.estado_final_id})` : ''}`}
                      />
                    )}
                    <TableRowItem title="Transição ID:" text={dados?.transicao_id} />
                    <TableRowItem title="Segmento:" text={dados?.seguimento} />
                    <TableRowItem title="Tipo:" text={dados?.tipo} />
                    <TableRowItem title="Email:" text={dados?.email} />
                    <TableRowItem title="Telefone:" text={dados?.telefone} />
                    <TableRowItem title="Título:" text={dados?.titulo} />
                    <TableRowItem title="Subtítulo:" text={dados?.sub_titulo} />
                    <TableRowItem title="Telefone:" text={dados?.telefone} />
                    <TableRowItem title="Página:" text={dados?.pagina} />
                    {dados?.data_formulario && <TableRowItem title="Telefone:" text={ptDate(dados?.data_formulario)} />}
                    {'prazoemdias' in dados && (
                      <TableRowItem
                        title="Prazo:"
                        text={`${dados?.prazoemdias} dia${dados?.prazoemdias > 1 ? 's' : ''}`}
                      />
                    )}
                    {perfil && (
                      <TableRowItem
                        title="Colaborador:"
                        text={`${perfil?.perfil?.displayName} (ID_Perfil: ${perfil?.perfil_id})`}
                      />
                    )}
                    {uo && <TableRowItem title="U.O:" text={`${uo?.label} (ID: ${uo?.id})`} />}
                    {uo && <TableRowItem title="Balcão:" text={uo?.balcao} />}
                    {'corpo' in dados && (
                      <TableRowItem title="Corpo:" item={<Markdown own children={dados?.corpo} />} />
                    )}
                    <TableRowItem title="Via:" text={dados?.via} />
                    <TableRowItem title="Concelho:" text={dados?.cidade} />
                    <TableRowItem title="Ilha:" text={dados?.ilha} />
                    {dados?.percentagem && <TableRowItem title="Percentagem:" text={fPercent(dados?.percentagem)} />}
                    {'ativo' in dados && <TableRowItem title="Ativo:" item={<LabelSN item={dados?.ativo} />} />}
                    {'is_ativo' in dados && <TableRowItem title="Ativo:" item={<LabelSN item={dados?.is_ativo} />} />}
                    {'to_alert' in dados && (
                      <TableRowItem title="Notificar:" item={<LabelSN item={dados?.to_alert} />} />
                    )}
                    {'is_paralelo' in dados && (
                      <TableRowItem title="Em paralelo:" item={<LabelSN item={dados?.is_paralelo} />} />
                    )}
                    {'limpo' in dados && <TableRowItem title="Limpo:" item={<LabelSN item={dados?.limpo} />} />}
                    {'requer_parecer' in dados && (
                      <TableRowItem title="Requer parecer:" item={<LabelSN item={dados?.requer_parecer} />} />
                    )}
                    {'formulario' in dados && (
                      <TableRowItem title="Formulário:" item={<LabelSN item={dados?.formulario} />} />
                    )}
                    {'anexo' in dados && <TableRowItem title="Anexo:" item={<LabelSN item={dados?.anexo} />} />}
                    {'identificador' in dados && (
                      <TableRowItem title="Identificador:" item={<LabelSN item={dados?.identificador} />} />
                    )}
                    {'obriga_prazo_validade' in dados && (
                      <TableRowItem title="Prazo de validade:" item={<LabelSN item={dados?.obriga_prazo_validade} />} />
                    )}
                    {'reutilizavel' in dados && (
                      <TableRowItem title="Reutilizável:" item={<LabelSN item={dados?.reutilizavel} />} />
                    )}
                    {'imputavel' in dados && (
                      <TableRowItem title="Imputável:" item={<LabelSN item={dados?.imputavel} />} />
                    )}
                    {'obrigatorio' in dados && (
                      <TableRowItem title="Obrigatório:" item={<LabelSN item={dados?.obrigatorio} />} />
                    )}
                    {'hasopnumero' in dados && (
                      <TableRowItem title="Indicar nº de operação:" item={<LabelSN item={dados?.hasopnumero} />} />
                    )}
                    {'is_after_devolucao' in dados && (
                      <TableRowItem title="Depois de devolução:" item={<LabelSN item={dados?.is_after_devolucao} />} />
                    )}
                    {'is_interno' in dados && (
                      <TableRowItem title="Processo interno:" item={<LabelSN item={dados?.is_interno} />} />
                    )}
                    {'is_credito' in dados && (
                      <TableRowItem title="Processo de crédito:" item={<LabelSN item={dados?.is_credito} />} />
                    )}
                    {'is_inicial' in dados && (
                      <TableRowItem title="Estado inicial:" item={<LabelSN item={dados?.is_inicial} />} />
                    )}
                    {'is_final' in dados && (
                      <TableRowItem title="Estado final:" item={<LabelSN item={dados?.is_final} />} />
                    )}
                    {'is_decisao' in dados && (
                      <TableRowItem title="Estado de decisão:" item={<LabelSN item={dados?.is_decisao} />} />
                    )}
                    {'credito_funcionario' in dados && (
                      <TableRowItem title="Crédito colaborador:" item={<LabelSN item={dados?.credito_funcionario} />} />
                    )}
                    {'funcionario' in dados && (
                      <TableRowItem title="Crédito colaborador:" item={<LabelSN item={dados?.funcionario} />} />
                    )}
                    {'is_con' in dados && (
                      <TableRowItem
                        title="Comunicação de operação de numerário:"
                        item={<LabelSN item={dados?.is_con} />}
                      />
                    )}
                    <TableRowItem title="Observação:" text={dados?.obs || dados?.observacao} />
                  </TableBody>
                </Table>
              </List>
              {item === 'motivosTransicao' && (
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Fluxos</Typography>
                  </ListItem>
                  <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ py: 1 }} spacing={1}>
                    {dados?.fluxos?.length > 0 ? (
                      applySort(dados?.fluxos, getComparator('asc', 'fluxo'))?.map((row) => (
                        <Label key={row?.id}>{row?.fluxo}</Label>
                      ))
                    ) : (
                      <Label>Todos</Label>
                    )}
                  </Stack>
                </List>
              )}
              {item === 'notificacoes' && destinatarios?.length > 0 && (
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5, mb: 0.25 }}>
                    <Typography variant="subtitle1">Destinatários</Typography>
                  </ListItem>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Contacto</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Ativo</TableCell>
                        <TableCell width={10}>
                          <DefaultAction small label="ADICIONAR" handleClick={() => setDestinatario({ add: true })} />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {destinatarios?.map((row) => (
                        <TableRow key={`dest_${row?.id}`}>
                          <TableCell>
                            <Typography variant="body2">{row?.email}</Typography>
                            <Typography variant="body2">{row?.telefone}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" noWrap>
                              Início: {row.data_inicio ? ptDate(row.data_inicio) : 'Sem data'}
                            </Typography>
                            <br />
                            <Typography variant="caption" noWrap>
                              Fim: {row.data_fim ? ptDate(row.data_fim) : 'Sem data'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Checked check={row.ativo} />
                          </TableCell>
                          <TableCell>
                            <UpdateItem dados={{ small: true }} handleClick={() => setDestinatario(row)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {!!destinatario && (
                    <DestinatarioForm
                      id={dados?.id}
                      selectedItem={destinatario}
                      onCancel={() => setDestinatario(null)}
                    />
                  )}
                </List>
              )}
              <List>
                <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                  <Typography variant="subtitle1">Registo</Typography>
                </ListItem>
                <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 1 }} spacing={2}>
                  <Resgisto label="Criado" por={dados?.criador} em={dados?.criado_em} />
                  <Resgisto
                    label="Modificado"
                    em={dados?.modificado_em}
                    por={dados?.modificador || dados?.modificado_por}
                  />
                </Stack>
              </List>
            </>
          ) : (
            <SearchNotFoundSmall message="Item não disponível..." />
          )}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

Resgisto.propTypes = { label: PropTypes.string, por: PropTypes.string, em: PropTypes.string };

function Resgisto({ label, por = '', em = '' }) {
  return por || em ? (
    <Stack spacing={0.5}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}:
      </Typography>
      {!!por && <Criado tipo="user" value={por} baralhar caption />}
      {!!em && <Criado tipo="data" value={ptDateTime(em)} baralhar caption />}
    </Stack>
  ) : (
    ''
  );
}

// ----------------------------------------------------------------------

TableRowItem.propTypes = { title: PropTypes.string, text: PropTypes.string, item: PropTypes.node };

function TableRowItem({ title, text = '', item = null }) {
  return text || item ? (
    <TableRow hover>
      <TableCell align="right" sx={{ color: 'text.secondary', pr: 0 }}>
        {title}
      </TableCell>
      <TableCell sx={{ minWidth: '70% !important' }}>{text || item}</TableCell>
    </TableRow>
  ) : (
    ''
  );
}

LabelSN.propTypes = { item: PropTypes.bool };

function LabelSN({ item = false }) {
  return <Label color={item ? 'success' : 'default'}>{item ? 'Sim' : 'Não'}</Label>;
}
