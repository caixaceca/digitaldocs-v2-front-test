import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
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
import { nomeacaoBySexo } from '../../utils/formatText';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// components
import Label from '../../components/Label';
import Markdown from '../../components/Markdown';
import { DefaultAction } from '../../components/Actions';
import { SearchNotFoundSmall } from '../../components/table';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import { Criado, CellChecked, DataLabel } from '../../components/Panel';
//
import { DestinatarioForm } from './form-fluxo';
import DetalhesTransicao from './detalhes-transicao';

// ----------------------------------------------------------------------

const fields = [
  { key: 'ativo', title: 'Ativo:' },
  { key: 'is_ativo', title: 'Ativo:' },
  { key: 'to_alert', title: 'Notificar:' },
  { key: 'is_paralelo', title: 'Em paralelo:' },
  { key: 'limpo', title: 'Limpo:' },
  { key: 'requer_parecer', title: 'Requer parecer:' },
  { key: 'formulario', title: 'Formulário:' },
  { key: 'anexo', title: 'Anexo:' },
  { key: 'identificador', title: 'Identificador:' },
  { key: 'obriga_prazo_validade', title: 'Prazo de validade:' },
  { key: 'reutilizavel', title: 'Reutilizável:' },
  { key: 'imputavel', title: 'Imputável:' },
  { key: 'obrigatorio', title: 'Obrigatório:' },
  { key: 'hasopnumero', title: 'Nº operação:' },
  { key: 'is_after_devolucao', title: 'Depois devolução:' },
  { key: 'is_interno', title: 'Processo interno:' },
  { key: 'is_credito', title: 'Processo de crédito:' },
  { key: 'is_inicial', title: 'Estado inicial:' },
  { key: 'is_final', title: 'Estado final:' },
  { key: 'is_decisao', title: 'Estado de decisão:' },
  { key: 'para_aprovacao', title: 'Aprovação:' },
  { key: 'facultativo', title: 'Facultativo:' },
  { key: 'padrao', title: 'Padrão:' },
  { key: 'gestor', title: 'Gestor:' },
  { key: 'observador', title: 'Observador:' },
  { key: 'is_con', title: 'Comunicação de operação de numerário:' },
];

// ----------------------------------------------------------------------

Detalhes.propTypes = { item: PropTypes.string, closeModal: PropTypes.func };

export function Detalhes({ item, closeModal }) {
  const { colaboradores } = useSelector((state) => state.intranet);
  const { selectedItem } = useSelector((state) => state.parametrizacao);
  const perfil = selectedItem?.perfil_id
    ? colaboradores?.find((row) => Number(row?.perfil_id) === Number(selectedItem?.perfil_id))
    : null;

  return (
    <Dialog
      open
      fullWidth
      onClose={closeModal}
      maxWidth={item === 'Transições' || item === 'Notificações' ? 'md' : 'sm'}
    >
      <DialogTitleAlt title="Detalhes" onClick={closeModal} />
      <DialogContent>
        {(item === 'Transições' && <DetalhesTransicao dados={selectedItem} />) ||
          (item === 'Notificações' && <Notificacao dados={selectedItem} />) || (
            <DetalhesContent dados={selectedItem} item={item} perfil={perfil} />
          )}
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
  const { isLoading } = useSelector((state) => state.parametrizacao);
  const uoAlt = uo || perfil?.uo;

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
                {(item === 'Fluxo' || item === 'Estado') && (
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Dados</Typography>
                  </ListItem>
                )}
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
                        title="Assunto:"
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
                    <TableRowItem title="Página:" text={dados?.pagina} />
                    {dados?.data_formulario && (
                      <TableRowItem title="Data formulário:" text={ptDate(dados?.data_formulario)} />
                    )}
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
                    {perfil && (
                      <TableRowItem
                        title="Função:"
                        text={nomeacaoBySexo(perfil?.nomeacao || perfil?.funcao, perfil?.sexo)}
                      />
                    )}
                    {uoAlt && <TableRowItem title="U.O:" text={`${uoAlt?.label} (ID: ${uoAlt?.id})`} />}
                    {uoAlt && <TableRowItem title="Balcão:" text={uoAlt?.balcao} />}
                    {'corpo' in dados && (
                      <TableRowItem title="Corpo:" item={<Markdown own children={dados?.corpo} />} />
                    )}
                    <TableRowItem title="Via:" text={dados?.via} />
                    <TableRowItem title="Concelho:" text={dados?.cidade} />
                    <TableRowItem title="Ilha:" text={dados?.ilha} />
                    {dados?.percentagem && <TableRowItem title="Percentagem:" text={fPercent(dados?.percentagem)} />}
                    {dados?.data_inicio && <TableRowItem title="Data início:" text={ptDateTime(dados?.data_inicio)} />}
                    {dados?.data_limite && <TableRowItem title="Data fim:" text={ptDateTime(dados?.data_limite)} />}
                    {fields.map(({ key, title }) =>
                      key in dados ? (
                        <TableRowItem key={key} title={title} item={<LabelSN item={dados[key]} />} />
                      ) : null
                    )}
                    <TableRowItem title="Nível de decisão:" text={dados?.nivel_decisao} />
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
              <List>
                <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                  <Typography variant="subtitle1">Registo</Typography>
                </ListItem>
                <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 1 }} spacing={2}>
                  <Resgisto
                    label="Criado"
                    por={dados?.criador || dados?.feito_por}
                    em={dados?.criado_em || dados?.ultima_alteracao}
                  />
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

Notificacao.propTypes = { dados: PropTypes.object };

function Notificacao({ dados }) {
  const [currentTab, setCurrentTab] = useState('Info');
  const { destinatarios } = useSelector((state) => state.parametrizacao);

  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} /> },
    { value: 'Destinatários', component: <Notificacoes id={dados?.id} destinatarios={destinatarios || []} /> },
  ];

  return (
    <>
      <TabsWrapperSimple
        tabsList={tabsList}
        currentTab={currentTab}
        sx={{ mt: 2, mb: 1, boxShadow: 'none' }}
        changeTab={(_, newValue) => setCurrentTab(newValue)}
      />
      <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
    </>
  );
}

// ----------------------------------------------------------------------

Notificacoes.propTypes = { destinatarios: PropTypes.array, id: PropTypes.number };

function Notificacoes({ destinatarios, id }) {
  const [destinatario, setDestinatario] = useState(null);
  return (
    <>
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">Contacto</TableCell>
            <TableCell size="small">Data</TableCell>
            <TableCell size="small" align="center">
              Ativo
            </TableCell>
            <TableCell size="small">Registo</TableCell>
            <TableCell size="small" width={10}>
              <DefaultAction small label="ADICIONAR" onClick={() => setDestinatario({ add: true })} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {destinatarios?.map((row) => (
            <TableRow hover key={`dest_${row?.id}`}>
              <TableCell>
                <Typography variant="body2">{row?.email}</Typography>
                <Typography variant="body2">{row?.telefone}</Typography>
              </TableCell>
              <TableCell>
                <DataLabel data={row?.data_inicio || ''} />
                <DataLabel data={row?.data_fim || ''} termino />
              </TableCell>
              <CellChecked check={row.ativo} />
              <TableCell>
                <Criado tipo="user" value={row?.modificador || row?.criador} baralhar caption />
                <Criado tipo="data" value={ptDateTime(row?.modificado_em || row?.criado_em)} caption />
              </TableCell>
              <TableCell>
                <DefaultAction small label="EDITAR" onClick={() => setDestinatario(row)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!destinatarios?.length && <SearchNotFoundSmall message="Nenhum destinatário adicionado..." />}
      {!!destinatario && <DestinatarioForm id={id} selectedItem={destinatario} onClose={() => setDestinatario(null)} />}
    </>
  );
}

// ----------------------------------------------------------------------

Resgisto.propTypes = { label: PropTypes.string, por: PropTypes.string, em: PropTypes.string };

export function Resgisto({ label, por = '', em = '' }) {
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

TableRowItem.propTypes = {
  item: PropTypes.node,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export function TableRowItem({ title, id = 0, text = '', item = null }) {
  return text || item ? (
    <TableRow hover>
      <TableCell align="right" sx={{ color: 'text.secondary', pr: 0, maxWidth: '25% !important' }}>
        {title}
      </TableCell>
      <TableCell sx={{ minWidth: '75% !important' }}>
        {(!!text && !!id && `${text} (ID: ${id})`) || (text && text) || (item && item)}
      </TableCell>
    </TableRow>
  ) : (
    ''
  );
}

LabelSN.propTypes = { item: PropTypes.bool };

export function LabelSN({ item = false }) {
  return <Label color={item ? 'success' : 'default'}>{item ? 'Sim' : 'Não'}</Label>;
}
